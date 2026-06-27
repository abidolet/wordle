import Board from "./components/Board";
import { useAuth } from "./components/AuthContext";
import { useNavigate } from "react-router-dom";

function Game() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  if (!isLoggedIn) {
    navigate("/");
    P;
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 tracking-wider">
        WORDLE
      </h1>
      <Board></Board>
    </div>
  );
}

export default Game;
