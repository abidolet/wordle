import { createBrowserRouter } from "react-router-dom";
import Game from "./Game";
import Auth from "./components/Auth";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";

export const router = createBrowserRouter([
	{
		path: "/play",
		element: <Game />,
	},
	{
		path: "/",
		element: <Auth />,
	},
	{
		path: "/auth/login",
		element: <SignIn />,
	},
	{
		path: "/auth/register",
		element: <SignUp />,
	},
]);
