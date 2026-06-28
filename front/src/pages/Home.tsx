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
		<div>
			<h1>Wordle</h1>
			<button onClick={handlePlay}>Play</button>
		</div>
	);
}
