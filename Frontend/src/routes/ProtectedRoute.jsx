import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, token } = useAuth();

  const isTokenValid = token && token !== "null" && token !== "undefined" && token !== "";

  if (!isAuthenticated || !isTokenValid) {
    return <Navigate to="/" replace />;
  }

  return children;
}