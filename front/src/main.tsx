import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { router } from "./Router";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) 
{
	throw new Error(
		"L'élément avec l'ID 'root' est introuvable dans le fichier index.html",
	);
}

createRoot(rootElement).render(
	<AuthProvider>
		<RouterProvider router={router} />
	</AuthProvider>,
);
