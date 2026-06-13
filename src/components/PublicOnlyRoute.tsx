import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function PublicOnlyRoute() {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <section className="page-section">
        <p className="status-text">Checking authentication...</p>
      </section>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;