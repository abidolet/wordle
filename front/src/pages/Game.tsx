import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, checkAuth, clearToken } from '../api/client';

interface LetterResult
{
	letter: string
	status: 'correct' | 'present' | 'absent'
}

interface GuessResult
{
	results: LetterResult[]
	won: boolean
	lost: boolean
	attemptsLeft: number
}

interface GameState
{
	attemptsLeft: number
	won: boolean
	lost: boolean
attempts: string[]
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
		checkAuth().then(ok => 
		{
			if (!ok) 
			{
				navigate('/');
				return;
			}
			apiFetch('/api/game')
				.then(res => res.json())
				.then((data: GameState) => setGameState(data));
		});
	}, [navigate]);

	async function handleGuess(e: React.FormEvent) 
	{
		e.preventDefault();
		if (currentGuess.length !== 5 || submitting) 
		{
			return;
		}

		setSubmitting(true);
		setError('');

		const res = await apiFetch('/api/game/guess',
			{
				method: 'POST',
				body: JSON.stringify({ guess: currentGuess }),
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
		setGameState(prev => prev ?
			{
				...prev,
				attemptsLeft: data.attemptsLeft,
				won: data.won,
				lost: data.lost,
				attempts: [...prev.attempts, currentGuess],
			} : prev);
		setCurrentGuess('');
		setSubmitting(false);
	}

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

	return (
		<div>
			<h1>Wordle</h1>
			<button type="button" onClick={handleLogout}>Logout</button>
			<p>Attempts left: {gameState.attemptsLeft}</p>

			<div>
				{rows.map((row, i) => (
					<div key={i}>
						{row.map((cell, j) => (
							<span key={j} data-status={cell.status}>
								{cell.letter}
							</span>
						))}
					</div>
				))}
			</div>

			{!gameState.won && !gameState.lost && (
				<form onSubmit={handleGuess}>
					<input
						type="text"
						value={currentGuess}
						onChange={e => setCurrentGuess(e.target.value.toLowerCase())}
						maxLength={5}
						minLength={5}
						autoFocus
						disabled={submitting}
					/>
					{error && <p role="alert">{error}</p>}
					<button type="submit" disabled={submitting || currentGuess.length !== 5}>
						Guess
					</button>
				</form>
			)}

			{gameState.won && <p>You won!</p>}
			{gameState.lost && <p>You lost!</p>}
		</div>
	);
}
