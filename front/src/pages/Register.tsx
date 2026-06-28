import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setToken } from '../api/client';

interface LocationState
{
	email?: string
}

export default function Register() 
{
	const navigate = useNavigate();
	const location = useLocation();
	const state = location.state as LocationState;

	const [email] = useState(state?.email ?? '');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	async function handleRegister(e: React.FormEvent) 
	{
		e.preventDefault();
		setError('');

		try 
		{
			const res = await fetch('/api/auth/register', {
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
			else if (res.status === 400) 
			{
				const data = await res.json();
				setError(data.message ?? 'Registration failed.');
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
			<h2>Create your account</h2>

			<form onSubmit={handleRegister}>
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

				<button type="submit">Create account</button>
			</form>
		</div>
	);
}
