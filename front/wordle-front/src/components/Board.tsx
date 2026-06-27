import { useState, useEffect } from "react";

function Board() {
  const word_to_guess = "words";
  const [board, setBoard] = useState(Array(6).fill(""));
  const [currentRow, setCurrentRow] = useState(0);
  const [colors, setColors] = useState(
    Array(6)
      .fill(null)
      .map(() => Array(5).fill(""))
  );
  const is_win = (currentBoard, row) => {
    if (currentBoard[row] === word_to_guess) {
      console.log("WIN!");
    }
  };

  const evaluateWord = (currentBoard, row) => {
    const word = currentBoard[row];
    const newRowColors = [];

    for (let i = 0; i < word.length; i++) {
      if (word_to_guess.includes(word[i])) {
        if (word[i] === word_to_guess[i]) {
          newRowColors.push("correct");
        } else {
          newRowColors.push("present");
        }
      } else {
        newRowColors.push("absent");
      }
    }

    const newColorsBoard = [...colors];
    newColorsBoard[row] = newRowColors;
    setColors(newColorsBoard);
  };

  const handleLogic = (event, currentBoard, row) => {
    const currentWord = currentBoard[row];

    if (/^[a-zA-Z]$/.test(event.key)) {
      if (currentWord.length < 5) {
        const newBoard = [...currentBoard];
        newBoard[row] = currentWord + event.key.toUpperCase();
        setBoard(newBoard);
      }
    }

    if (event.key === "Backspace") {
      if (currentWord.length > 0) {
        const newBoard = [...currentBoard];
        newBoard[row] = currentWord.slice(0, -1);
        setBoard(newBoard);
      }
    }

    if (event.key === "Enter") {
      if (currentWord.length === 5) {
        console.log("Envoi au backend du mot :", currentWord);
        if (row < 5) {
          setCurrentRow(row + 1);
          is_win(currentBoard, row);
          evaluateWord(currentBoard, row);
        }
      }
    }
  };

  useEffect(() => {
    const listener = (event) => {
      handleLogic(event, board, currentRow);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [board, currentRow]);

  return (
    <div className="grid grid-cols-5 gap-2">
      {Array.from({ length: 30 }).map((_, index) => {
        const rowIndex = Math.floor(index / 5);
        const colIndex = index % 5;
        const letter = board[rowIndex][colIndex] || "";
        const status = colors[rowIndex][colIndex];
        let bgColor = "bg-gray-800 text-white-800 border-gray-300";
        if (status === "correct")
          bgColor = "bg-green-500 text-white border-green-500";
        if (status === "present")
          bgColor = "bg-yellow-500 text-white border-yellow-500";

        return (
          <div
            key={index}
            className={`${bgColor} w-14 h-14 sm:w-16 sm:h-16 border-2 border-gray-300 flex items-center justify-center text-3xl font-bold uppercase bg-white text-gray-800 select-none`}
          >
            {letter}
          </div>
        );
      })}
    </div>
  );
}

export default Board;
