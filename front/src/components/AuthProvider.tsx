import { useState } from "react";
import { AuthContext } from "../context/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) 
{
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => 
	{
		return localStorage.getItem("isLoggedIn") === "true";
	});

	const [token, setToken] = useState<string | null>(() => 
	{
		return localStorage.getItem("accessToken");
	});

	const [gameData, setGameData] = useState<unknown>(null);

	const login = (newToken: string) => 
	{
		setIsLoggedIn(true);
		setToken(newToken);
		localStorage.setItem("isLoggedIn", "true");
		localStorage.setItem("accessToken", newToken);
	};

	const logout = () => 
	{
		setIsLoggedIn(false);
		setToken(null);
		localStorage.removeItem("isLoggedIn");
		localStorage.removeItem("accessToken");
	};

	const fetchGameStatus = async (token: string) => 
	{
		try 
		{
			const res = await fetch("https://localhost:8443/game/status", {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.ok) 
			{
				const data = await res.json();
				setGameData(data);
			}
		}
		catch (err) 
		{
			console.error(err);
		}
	};

	return (
		<AuthContext.Provider
			value={{ isLoggedIn, token, login, logout, gameData, fetchGameStatus }}
		>
			{children}
		</AuthContext.Provider>
	);
}
