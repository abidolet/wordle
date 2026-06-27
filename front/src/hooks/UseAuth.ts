import { useContext } from "react";
import { AuthContext, type AuthContextType } from "../context/AuthContext"; 

export const UseAuth = (): AuthContextType => 
{
	const context = useContext(AuthContext);
  
	if (!context) 
	{
		throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
	}
  
	return context;
};
