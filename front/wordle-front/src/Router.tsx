import { createBrowserRouter } from "react-router-dom";
import Game from "./Game";
import Home from "./components/Home";
export const router = createBrowserRouter([
  {
    path: "/game",
    element: <Game />,
  },
  {
    path: "/",
    element: <Home />,
  },
]);
