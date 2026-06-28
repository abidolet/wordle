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
		<div>
			<h1>Wordle</h1>
			<h2>Welcome back</h2>
			<h3>Enter your password to log in.</h3>

			<form onSubmit={handleLogin}>
				<label htmlFor="email">Email address</label>
				<input
					id="email"
					type="email"
					value={email}
					readOnly
				/>
				<button type="button" onClick={() => navigate('/auth', { state: { email } })}>
					Edit
				</button>

				<label htmlFor="password">Password</label>
				<input
					id="password"
					type={showPassword ? 'text' : 'password'}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					autoFocus={!!state?.email}
				/>

				<button type="button" onClick={() => setShowPassword(p => !p)}>
					{showPassword ? 'Hide' : 'Show'}
				</button>

				{error && <p role="alert">{error}</p>}

				<button type="submit">Log in</button>
			</form>
		</div>
	);
}
