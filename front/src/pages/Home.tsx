import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../api/client';

export default function Home() 
{
	const navigate = useNavigate();
	const [checking, setChecking] = useState(true);

	async function handlePlay() 
	{
		const connected = await checkAuth();
		if (connected) 
		{
			navigate('/game');
		}
		else 
		{
			navigate('/auth');
		}
	}

	useEffect(() => 
	{
		setChecking(false);
	}, []);

	if (checking) 
	{
		return null;
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-white font-sans text-gray-900">
			<div className="mb-6 grid grid-cols-3 gap-1.5">
				<div className="h-10 w-10 border-2 border-gray-900 bg-white" />
				<div className="h-10 w-10 border-2 border-gray-900 bg-yellow-500" />
				<div className="h-10 w-10 border-2 border-gray-900 bg-green-600" />
				<div className="h-10 w-10 border-2 border-gray-900 bg-green-600" />
				<div className="h-10 w-10 border-2 border-gray-900 bg-green-600" />
				<div className="h-10 w-10 border-2 border-gray-900 bg-green-600" />
			</div>

			<h1 className="mb-2 text-6xl font-bold tracking-tight">Wordle</h1>
			<p className="mb-10 text-xl text-gray-700">Get 6 chances to guess a 5-letter word.</p>

			<div className="flex gap-4">
				<button 
					onClick={handlePlay} 
					className="rounded-full bg-gray-900 px-10 py-3 font-bold text-white hover:bg-gray-800"
				>
                    Play
				</button>
			</div>

			<div className="mt-12 text-center text-sm text-gray-500">
				<p>June 28, 2026</p>
				<p>No. 1835</p>
				<p>Edited by Yondemon</p>
			</div>
		</div>
	);
}