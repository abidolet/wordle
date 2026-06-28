import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Login from './pages/Login';
import Register from './pages/Register';
import Game from './pages/Game';
import Error from './pages/Error';

export default function App() 
{
	return (
		<Routes>
			<Route path="/" element={<Game />} />
			<Route path="/auth" element={<Auth />} />
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route path="/game" element={<Game />} />
			<Route path="/error" element={<Error />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}
