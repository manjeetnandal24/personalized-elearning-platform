import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function StudentRoute() {
  const { isAuthenticated, isAuthLoading, user } = useAuth();

  if (isAuthLoading) {
    return <p className="status-text">Checking student access...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === "INSTRUCTOR") {
    return <Navigate to="/instructor" replace />;
  }

  if (user?.role !== "STUDENT") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default StudentRoute;