import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function StudentRoute() {
  const { user, isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <section className="page-section">
        <p className="status-text">Checking student access...</p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default StudentRoute;