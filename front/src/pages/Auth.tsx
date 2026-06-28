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
				navigate(exists ? '/login' : '/register', { state: { email } });
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
		<div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 font-sans text-gray-900">
			<div className="w-full max-w-sm text-center">
				<h1 className="mb-2 text-6xl font-bold tracking-tight">Wordle</h1>
				<h2 className="mb-10 text-xl font-medium text-gray-700">Log in or create an account</h2>

				<form onSubmit={handleContinue} className="space-y-4">
					<div className="text-left">
						<label htmlFor="email" className="sr-only">Email address</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
							className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-gray-900 focus:outline-none"
							required
							autoFocus
						/>
					</div>

					{error && (
						<p role="alert" className="text-sm text-red-600">
							{error}
						</p>
					)}

					<button 
						type="submit" 
						disabled={submitting}
						className="w-full rounded-full bg-gray-900 py-3 font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
					>
						{submitting ? 'Checking...' : 'Continue'}
					</button>
				</form>
			</div>
		</div>
	);
}