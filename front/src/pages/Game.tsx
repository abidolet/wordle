import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, checkAuth, clearToken } from '../api/client';

export default function Game() 
{
	const navigate = useNavigate();

	useEffect(() => 
	{
		checkAuth().then((ok) => 
		{
			if (!ok) 
			{
				navigate('/');
			}
		});
	}, [navigate]);

	async function handleLogout() 
	{
		await apiFetch('/api/auth/logout', { method: 'POST' });
		clearToken();
		navigate('/');
	}

	return (
		<div>
			<h1>Wordle</h1>
			<p>Game coming soon</p>

			<button onClick={handleLogout}>Logout</button>
		</div>
	);
}
