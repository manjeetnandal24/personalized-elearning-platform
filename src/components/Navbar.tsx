import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="logo-link">
        <h2 className="logo">LearnTrack</h2>
      </NavLink>

      <nav>
        <NavLink
          to="/"
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

      <NavLink to="/login" className="login-button">
        Login
      </NavLink>
    </header>
  );
}

export default Navbar;
