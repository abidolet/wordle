import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, checkAuth, clearToken, setToken } from '../api/client';

interface LetterResult {
  letter: string;
  status: 'correct' | 'present' | 'absent';
}

interface GuessResult {
  results: LetterResult[];
  won: boolean;
  lost: boolean;
  attemptsLeft: number;
}

interface GameState {
  attemptsLeft: number;
  won: boolean;
  lost: boolean;
  attempts: string[];
  results: LetterResult[][];
}

export default function Game() 
{
	const navigate = useNavigate();
	const [gameState, setGameState] = useState<GameState | null>(null);
	const [rows, setRows] = useState<LetterResult[][]>([]);
	const [currentGuess, setCurrentGuess] = useState('');
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => 
	{
		const params = new URLSearchParams(window.location.search);
		const token = params.get('token');
		if (token) 
		{
			setToken(token);
			sessionStorage.setItem('auth', '1');
			window.history.replaceState({}, '', '/game');
		}
	}, []);

	useEffect(() => 
	{
		checkAuth().then(ok => 
		{
			if (!ok) 
			{
				navigate('/');
				return;
			}
			apiFetch('/api/game')
				.then(res => res.json())
				.then((data: GameState) => 
				{
					setGameState(data);
					setRows(data.results ?? []);
				});
		});
	}, [navigate]);

	const submitGuess = useCallback(async (guess: string) => 
	{
		if (guess.length !== 5 || submitting || gameState?.won || gameState?.lost || gameState?.attemptsLeft === 0) 
		{
			return;
		}

		setSubmitting(true);
		setError('');

		const res = await apiFetch('/api/game/guess', {
			method: 'POST',
			body: JSON.stringify({ guess }),
		});

		if (res.status === 400) 
		{
			const data = await res.json();
			setError(data.message);
			setSubmitting(false);
			return;
		}

		const data: GuessResult = await res.json();

		setRows(prev => [...prev, data.results]);
		setGameState(prev => prev ? {
			...prev,
			attemptsLeft: data.attemptsLeft,
			won: data.won,
			lost: data.lost,
			attempts: [...prev.attempts, guess],
			results: [...prev.results, data.results],
		} : prev);
    
		setCurrentGuess('');
		setSubmitting(false);
	}, [submitting, gameState]);

	useEffect(() => 
	{
		const handleKeyDown = (e: KeyboardEvent) => 
		{
			if (gameState?.won || gameState?.lost || gameState?.attemptsLeft === 0) 
			{
				return;
			}

			if (/^[a-zA-Z]$/.test(e.key)) 
			{
				setCurrentGuess(prev => (prev.length < 5 ? prev + e.key.toUpperCase() : prev));
			}
			else if (e.key === 'Backspace') 
			{
				setCurrentGuess(prev => prev.slice(0, -1));
			}
			else if (e.key === 'Enter') 
			{
				submitGuess(currentGuess);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [currentGuess, submitGuess, gameState]);

	async function handleLogout() 
	{
		await apiFetch('/api/auth/logout', { method: 'POST' });
		clearToken();
		navigate('/');
	}

	if (!gameState) 
	{
		return <p>Loading...</p>;
	}

	const isGameOver = gameState.won || gameState.lost || gameState.attemptsLeft === 0;

	return (
		<div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-100 p-4">
			<h1 className="text-4xl font-bold mb-6">Wordle</h1>
      
			<button 
				onClick={handleLogout} 
				className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
			>
        Logout
			</button>
      
			{isGameOver ? (
				<div className="mb-6 p-4 bg-yellow-200 border border-yellow-400 rounded-lg text-center shadow-sm">
					<p className="text-xl font-bold text-yellow-800">You already played today !</p>
					<p className="text-yellow-700 mt-1">Come back tomorrow to guess a new word !</p>
				</div>
			) : (
				<p className="text-xl mb-4 font-semibold">Attempts left: {gameState.attemptsLeft}</p>
			)}

			<div className="grid grid-rows-6 gap-2 mb-6">
				{[...Array(6)].map((_, i) => (
					<div key={i} className="grid grid-cols-5 gap-2">
						{[...Array(5)].map((_, j) => 
						{
							const cell = rows[i]?.[j] || { letter: i === rows.length && !isGameOver ? currentGuess[j] : '', status: null };
              
							let bgColor = "bg-white border-gray-300 text-gray-800";
							if (cell.status === "correct") 
							{
								bgColor = "bg-green-500 border-green-500 text-white";
							}
							if (cell.status === "present") 
							{
								bgColor = "bg-yellow-500 border-yellow-500 text-white";
							}
							if (cell.status === "absent") 
							{
								bgColor = "bg-gray-500 border-gray-500 text-white";
							}
              
							return (
								<div 
									key={j} 
									className={`${bgColor} w-20 h-20 sm:w-24 sm:h-24 border-2 flex items-center justify-center text-4xl font-bold uppercase transition-colors duration-300`}
								>
									{cell.letter}
								</div>
							);
						})}
					</div>
				))}
			</div>

			{error && <p className="text-red-500 font-bold mb-4">{error}</p>}
      
			{gameState.won && <p className="text-green-600 text-2xl font-bold mt-2">Congratulations, you won !</p>}
			{gameState.lost && <p className="text-red-600 text-2xl font-bold mt-2">You lost...</p>}

		</div>
	);
}
