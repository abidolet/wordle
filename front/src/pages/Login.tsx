import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setToken } from '../api/client';

interface LocationState
{
	email?: string
}

export default function Login() 
{
	const navigate = useNavigate();
	const location = useLocation();
	const state = location.state as LocationState;

	const [email] = useState(state?.email ?? '');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	async function handleLogin(e: React.FormEvent) 
	{
		e.preventDefault();
		setError('');

		try 
		{
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});

			if (res.ok) 
			{
				const data = await res.json();
				setToken(data.accessToken);
				navigate('/game');
			}
			else if (res.status === 401) 
			{
				setError('Invalid email or password.');
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
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 font-sans text-gray-900">
			<div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 font-sans text-gray-900">
				<img src="favicon.png" alt="Favicon" className="w-32 h-32 mb-8"/>

				<h1 className="mb-2 text-6xl font-bold tracking-tight">Wordle</h1>
				<h2 className="mb-10 text-xl font-medium text-gray-700">Welcome back</h2>

				<form onSubmit={handleLogin} className="space-y-4">
					<div className="relative text-left">
						<label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email</label>
						<div className="flex items-center gap-2">
							<input
								id="email"
								type="email"
								value={email}
								readOnly
								className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 outline-none"
							/>
							<button 
								type="button" 
								onClick={() => navigate('/auth', { state: { email } })}
								className="text-sm font-bold text-blue-600 hover:underline"
							>
                                Edit
							</button>
						</div>
					</div>

					<div className="text-left">
						<label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">Password</label>
						<div className="relative">
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
								required
								autoFocus={!!state?.email}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(p => !p)}
								className="absolute right-4 top-3 text-sm font-bold text-gray-500 hover:text-gray-900"
							>
								{showPassword ? 'Hide' : 'Show'}
							</button>
						</div>
					</div>

					{error && <p role="alert" className="text-sm text-red-600">{error}</p>}

					<button 
						type="submit"
						className="w-full rounded-full bg-gray-900 py-3 font-bold text-white transition hover:bg-gray-800"
					>
                        Log in
					</button>
				</form>
			</div>
		</div>
	);
}
