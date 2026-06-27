import { createContext } from "react";

export interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  login: (newToken: string) => void;
  logout: () => void;
  gameData: unknown;
}

export const AuthContext = createContext<AuthContextType | null>(null);
