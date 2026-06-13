import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="navbar">
      <NavLink to="/" className="logo-link">
        <h2 className="logo">LearnTrack</h2>
      </NavLink>

      <nav>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "nav-link active-link" : "nav-link"
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/courses"
          className={({ isActive }) =>
            isActive ? "nav-link active-link" : "nav-link"
          }
        >
          Courses
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-link active-link" : "nav-link"
          }
        >
          Dashboard
        </NavLink>
      </nav>

      {isAuthenticated && user ? (
        <div className="auth-actions">
          <span className="welcome-text">Hi, {user.name}</span>

          <button type="button" className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="auth-actions">
          <NavLink to="/login" className="text-link-button">
            Login
          </NavLink>

          <NavLink to="/register" className="login-button">
            Register
          </NavLink>
        </div>
      )}
    </header>
  );
}

export default Navbar;