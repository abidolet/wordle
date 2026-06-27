import { useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold mb-12 text-gray-800 tracking-widest drop-shadow-md">
        WORDLE
      </h1>

      <div className="flex flex-col items-center">
        {isLoggedIn ? (
          <Link
            to="/play"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-lg text-2xl shadow-lg transition-transform transform hover:scale-105"
          >
            PLAY
          </Link>
        ) : (
          <div className="flex space-x-6">
            <Link
              to="/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded shadow transition-colors"
            >
              Sign In
            </Link>

            <Link
              to="/signup"
              className="bg-white hover:bg-gray-100 text-blue-600 border-2 border-blue-600 font-bold py-3 px-8 rounded shadow transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Bouton de triche pour tester le visuel (à supprimer plus tard) */}
      <button
        onClick={() => setIsLoggedIn(!isLoggedIn)}
        className="mt-16 text-sm text-gray-400 underline hover:text-gray-600"
      >
        Tester l'affichage (Connecté : {isLoggedIn ? "Oui" : "Non"})
      </button>
    </div>
  );
}

export default Home;
