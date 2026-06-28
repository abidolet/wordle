import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../api/client';

export default function Home() 
{
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => 
	{
		checkAuth().then((connected) => 
		{
			if (connected) 
			{
				navigate('/game');
			}
			else 
			{
				setLoading(false);
			}
		});
	}, [navigate]);

	async function handleContinue(e: React.FormEvent) 
	{
		e.preventDefault();
		if (!email.trim()) 
		{
			return;
		}

		setSubmitting(true);
		setError('');

		try 
		{
			const res = await fetch('/api/auth/check-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});

			if (res.ok)
			{
				const { exists } = await res.json();
				const path = exists ? '/login' : '/register';
				navigate(path, { state: { email } });
			}
			else 
			{
				setError('Something went wrong, please try again.');
			}
		}
		catch 
		{
			setError('Something went wrong, please try again.');
		}
		finally 
		{
			setSubmitting(false);
		}
	}

	if (loading) 
	{
		return null;
	}

	return (
		<div>
			<h1>Wordle</h1>
			<h2>Log in or create an account</h2>

			<form onSubmit={handleContinue}>
				<label htmlFor="email">Email address</label>
				<input
					id="email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Enter your email"
					required
					autoFocus
				/>

				{error && <p role="alert">{error}</p>}

				<button type="submit" disabled={submitting}>
					{submitting ? 'Checking...' : 'Continue'}
				</button>
			</form>
		</div>
	);
}
