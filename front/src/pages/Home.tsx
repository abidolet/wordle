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
			<img src="favicon.png" alt="Favicon" className="w-32 h-32 mb-8"/>

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
				<p>Created by Abidolet, Yondemon</p>
			</div>
		</div>
	);
}
