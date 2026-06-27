import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useEffect } from "react";
function Auth() {
  const { isLoggedIn, token, fetchGameStatus, gameData, logout } = useAuth();
  useEffect(() => {
    if (isLoggedIn && token) {
      fetchGameStatus(token);
    }
  }, [isLoggedIn, token]);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold mb-12 text-gray-800 tracking-widest drop-shadow-md">
        WORDLE
      </h1>

      <div className="flex flex-col items-center">
        {isLoggedIn ? (
          <div className="flex flex-col items-center space-y-6">
            <Link
              to="/play"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-lg text-2xl shadow-lg transition-transform transform hover:scale-105"
            >
              PLAY
            </Link>

            <button
              onClick={logout}
              className="text-gray-500 hover:text-red-500 font-semibold underline transition-colors"
            >
              Se déconnecter
            </button>
            {isLoggedIn && gameData && (
              <div className="mt-8 text-gray-600">
                <p>
                  Parties en cours : {gameData.attempts.length} tentatives
                  effectuées
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex space-x-6">
            <Link
              to="/auth/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded shadow transition-colors"
            >
              Sign In
            </Link>

            <Link
              to="/auth/register"
              className="bg-white hover:bg-gray-100 text-blue-600 border-2 border-blue-600 font-bold py-3 px-8 rounded shadow transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Auth;
