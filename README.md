# Wordle

A recreation of the [Wordle](https://www.nytimes.com/games/wordle/index.html) game developed by Josh Wardle

---

## How to play

You must guess a word from the english dictionary in 6 tries.  
Each guess must be a valid 5-letter word.  
The color of the tiles will change to show how close your guess was to the word.

🟩 correct — right letter, right position  
🟨 present — right letter, wrong position  
⬛ absent  — letter not in the word

---

## Getting Started

### Requirements

Docker & Docker compose

### Setup

```bash
git clone https://github.com/abidolet/wordle.git
cd wordle
```

### Run

```bash
docker compose up --build
```

### Architecture

This game is developed using microservices orchestrated by docker
- The gateway is built using Kong
- The auth is built using C# with Identity
- The game is built using Golang
- The front is built using React and Typescript 

![Networks Screenshot](https://raw.githubusercontent.com/abidolet/wordle/assets/networks.png) 

---

## Previews
![Game Screenshot](https://raw.githubusercontent.com/abidolet/wordle/assets/home.png) 

![Leaderboard Screenshot](https://raw.githubusercontent.com/abidolet/wordle/assets/login.png)  

![Menu Screenshot](https://raw.githubusercontent.com/abidolet/wordle/assets/game.png)

---

## Authors

**abidolet** — [abidolet](https://github.com/abidolet)  
**aluslu** — [Yondemon4266](https://github.com/Yondemon4266)

---
