package main

import (
	"bufio"
	"context"
	"encoding/base64"
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

var (
	rdb       *redis.Client
	wordList  []string
	ctx       = context.Background()
)

type Game struct {
	Word     string   `json:"word"`
	Attempts []string `json:"attempts"`
	Won      bool     `json:"won"`
}

type GuessRequest struct {
	Guess string `json:"guess"`
}

type LetterResult struct {
	Letter string `json:"letter"`
	Status string `json:"status"`
}

type GuessResponse struct {
	Results        []LetterResult `json:"results"`
	Won            bool           `json:"won"`
	Lost           bool           `json:"lost"`
	AttemptsLeft   int            `json:"attemptsLeft"`
}

type StatusResponse struct {
	AttemptsLeft int      `json:"attemptsLeft"`
	Won          bool     `json:"won"`
	Lost         bool     `json:"lost"`
	Attempts     []string `json:"attempts"`
}

type ErrorResponse struct {
	Message string `json:"message"`
}

func main() {
	loadWords("words.txt")
	scheduleWordRotation()

	rdb = redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_ADDR"),
		Password: os.Getenv("REDIS_PASSWORD"),
	})

	if _, err := rdb.Ping(ctx).Result(); err != nil {
		log.Fatalf("Redis connection failed: %v", err)
	}

	ensureTodayWord()

	mux := http.NewServeMux()
	mux.HandleFunc("/api/game", handleGame)
	mux.HandleFunc("/api/game/guess", handleGuess)

	log.Println("word-service listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}

func loadWords(path string) {
	f, err := os.Open(path)
	if err != nil {
		log.Fatalf("cannot open words file: %v", err)
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		w := strings.TrimSpace(strings.ToLower(scanner.Text()))
		if len(w) == 5 {
			wordList = append(wordList, w)
		}
	}

	if len(wordList) == 0 {
		log.Fatal("word list is empty")
	}
	log.Printf("loaded %d words", len(wordList))
}

func todayKey() string {
	return "word:" + time.Now().UTC().Format("2006-01-02")
}

func gameKey(userID string) string {
	return "game:" + userID + ":" + time.Now().UTC().Format("2006-01-02")
}

func ensureTodayWord() {
	key := todayKey()
	exists, _ := rdb.Exists(ctx, key).Result()
	if exists == 0 {
		word := wordList[rand.Intn(len(wordList))]
		midnight := nextMidnight()
		rdb.Set(ctx, key, word, time.Until(midnight))
		log.Printf("today's word set: %s (expires at %s)", word, midnight.Format(time.RFC3339))
	}
}

func scheduleWordRotation() {
	go func() {
		for {
			time.Sleep(time.Until(nextMidnight()))
			ensureTodayWord()
		}
	}()
}

func nextMidnight() time.Time {
	now := time.Now().UTC()
	return time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, time.UTC)
}

func userID(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return ""
	}

	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	
	parts := strings.Split(tokenStr, ".")
	if len(parts) != 3 {
		return ""
	}
	
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return ""
	}
	
	var claims map[string]any
	if err := json.Unmarshal(payload, &claims); err != nil {
		return ""
	}
	
	sub, _ := claims["sub"].(string)
	return sub
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func handleGame(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		handleStatus(w, r)
	default:
		writeJSON(w, http.StatusMethodNotAllowed, ErrorResponse{"method not allowed"})
	}
}

func handleGuess(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, ErrorResponse{"method not allowed"})
		return
	}

	var req GuessRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{"invalid body"})
		return
	}

	guess := strings.ToLower(strings.TrimSpace(req.Guess))

	if len(guess) != 5 {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{"guess must be 5 characters"})
		return
	}

	if !isValidWord(guess) {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{"not a valid word"})
		return
	}

	uid := userID(r)
	key := gameKey(uid)
	raw, err := rdb.Get(ctx, key).Result()
	if err != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{"no active game, call /api/game/create first"})
		return
	}

	var game Game
	json.Unmarshal([]byte(raw), &game)

	if game.Won {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{"game already won"})
		return
	}

	if len(game.Attempts) >= 6 {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{"no attempts left"})
		return
	}

	game.Attempts = append(game.Attempts, guess)
	results := compare(game.Word, guess)

	if guess == game.Word {
		game.Won = true
	}

	data, _ := json.Marshal(game)
	rdb.Set(ctx, key, data, time.Until(nextMidnight()))

	writeJSON(w, http.StatusOK, GuessResponse{
		Results:      results,
		Won:          game.Won,
		Lost:         !game.Won && len(game.Attempts) >= 6,
		AttemptsLeft: 6 - len(game.Attempts),
	})
}

func handleStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, ErrorResponse{"method not allowed"})
		return
	}

	uid := userID(r)
	if uid == "" {
		writeJSON(w, http.StatusUnauthorized, ErrorResponse{"missing user id"})
		return
	}

	key := gameKey(uid)
	raw, err := rdb.Get(ctx, key).Result()

	if err != nil {
		todayWord, err := rdb.Get(ctx, todayKey()).Result()
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, ErrorResponse{"word not available"})
			return
		}
		game := Game{Word: todayWord, Attempts: []string{}, Won: false}
		data, _ := json.Marshal(game)
		rdb.Set(ctx, key, data, time.Until(nextMidnight()))
		raw = string(data)
	}

	var game Game
	json.Unmarshal([]byte(raw), &game)

	writeJSON(w, http.StatusOK, StatusResponse{
		AttemptsLeft: 6 - len(game.Attempts),
		Won:          game.Won,
		Lost:         !game.Won && len(game.Attempts) >= 6,
		Attempts:     game.Attempts,
	})
}

func compare(word, guess string) []LetterResult {
	results := make([]LetterResult, 5)
	wordRunes := []rune(word)
	guessRunes := []rune(guess)
	used := make([]bool, 5)

	for i := range results {
		results[i] = LetterResult{Letter: string(guessRunes[i]), Status: "absent"}
	}

	for i := 0; i < 5; i++ {
		if guessRunes[i] == wordRunes[i] {
			results[i].Status = "correct"
			used[i] = true
		}
	}

	for i := 0; i < 5; i++ {
		if results[i].Status == "correct" {
			continue
		}
		for j := 0; j < 5; j++ {
			if !used[j] && guessRunes[i] == wordRunes[j] {
				results[i].Status = "present"
				used[j] = true
				break
			}
		}
	}

	return results
}

func isValidWord(word string) bool {
	for _, w := range wordList {
		if w == word {
			return true
		}
	}
	return false
}
