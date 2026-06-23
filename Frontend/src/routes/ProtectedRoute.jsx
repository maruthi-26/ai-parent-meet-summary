import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, token, user } = useAuth();

  const isTokenValid = token && token !== "null" && token !== "undefined" && token !== "";

  if (!isAuthenticated || !isTokenValid) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "ADMIN" ? "/dashboard" : "/teacherDashboard"} replace />;
  }

  return children;
}