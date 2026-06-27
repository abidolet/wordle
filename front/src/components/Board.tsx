import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";

function Board() 
{
	const [board, setBoard] = useState(Array(6).fill(""));
	const [currentRow, setCurrentRow] = useState(0);
	const [colors] = useState(
		Array(6)
			.fill(null)
			.map(() => Array(5).fill("")),
	);

	const { token } = useAuth();
	const headers = {
		"Content-Type": "application/json",
		Authorization: token ? `Bearer ${token}` : "",
	};

	useEffect(() => 
	{
		const initGame = async () => 
		{
			await fetch("https://localhost:8443/game/create", {
				method: "POST",
				headers,
			});

			const res = await fetch("https://localhost:8443/game/status", {
				method: "GET",
				headers,
			});
			if (res.ok) 
			{
				// const data = await res.json();
			}
		};
		initGame();
	}, []);

	const submitGuess = async (word) => 
	{
		const res = await fetch("https://localhost:8443/game/guess", {
			method: "POST",
			headers,
			body: JSON.stringify({ guess: word }),
		});

		if (res.ok) 
		{
			const data = await res.json();
			console.log(data);
		}
		else 
		{
			// Gestion erreur (ex: mot invalide)
		}
	};

	const handleLogic = (event, currentBoard, row) => 
	{
		const currentWord = currentBoard[row];

		if (/^[a-zA-Z]$/.test(event.key)) 
		{
			if (currentWord.length < 5) 
			{
				const newBoard = [...currentBoard];
				newBoard[row] = currentWord + event.key.toUpperCase();
				setBoard(newBoard);
			}
		}

		if (event.key === "Backspace") 
		{
			if (currentWord.length > 0) 
			{
				const newBoard = [...currentBoard];
				newBoard[row] = currentWord.slice(0, -1);
				setBoard(newBoard);
			}
		}

		if (event.key === "Enter") 
		{
			if (currentWord.length === 5) 
			{
				submitGuess(currentWord);
				if (row < 5) 
				{
					setCurrentRow(row + 1);
				}
			}
		}
	};

	useEffect(() => 
	{
		const listener = (event) => 
		{
			handleLogic(event, board, currentRow);
		};
		window.addEventListener("keydown", listener);
		return () => window.removeEventListener("keydown", listener);
	}, [board, currentRow]);

	return (
		<div className="grid grid-cols-5 gap-2">
			{Array.from({ length: 30 }).map((_, index) => 
			{
				const rowIndex = Math.floor(index / 5);
				const colIndex = index % 5;
				const letter = board[rowIndex][colIndex] || "";
				const status = colors[rowIndex][colIndex];
				let bgColor = "bg-gray-800 text-white-800 border-gray-300";
				if (status === "correct")
				{
					bgColor = "bg-green-500 text-white border-green-500";
				}
				if (status === "present")
				{
					bgColor = "bg-yellow-500 text-white border-yellow-500";
				}

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
