import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 1. On initialise le state avec ce qui est déjà dans le localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("accessToken");
  });

  const login = (newToken) => {
    setIsLoggedIn(true);
    setToken(newToken);

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("accessToken", newToken);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("accessToken");
  };
  const [gameData, setGameData] = useState(null);

  const fetchGameStatus = async (token) => {
    try {
      const res = await fetch("https://localhost:8443/game/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGameData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // N'oublie pas d'ajouter gameData et fetchGameStatus dans le .Provider value={{...}}

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, token, login, logout, gameData, fetchGameStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
