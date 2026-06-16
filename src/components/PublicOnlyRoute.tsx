import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function PublicOnlyRoute() {
  const { user, isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <section className="page-section">
        <p className="status-text">Checking authentication...</p>
      </section>
    );
  }

  if (isAuthenticated) {
    const redirectPath = user?.role === "ADMIN" ? "/admin" : "/dashboard";

    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;