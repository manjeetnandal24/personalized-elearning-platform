import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

type SidebarLinkProps = {
  to: string;
  icon: string;
  label: string;
};

function SidebarLink({ to, icon, label }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? "sidebar-link active-sidebar-link" : "sidebar-link"
      }
    >
      <span className="sidebar-link-icon">{icon}</span>
      {label}
    </NavLink>
  );
}

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const isInstructor = user?.role === "INSTRUCTOR";
  const isStudent = user?.role === "STUDENT";

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <NavLink to="/" className="sidebar-logo-link">
          <div className="sidebar-logo-icon">🎓</div>

          <div>
            <h2 className="sidebar-logo">LearnTrack</h2>
            <p>Learning Management System</p>
          </div>
        </NavLink>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-group">
          <p className="sidebar-group-title">MAIN</p>

          <SidebarLink to="/" icon="🏠" label="Home" />
          <SidebarLink to="/courses" icon="📚" label="Courses" />
        </div>

       {isAuthenticated && isInstructor &&  (
  <>
    <div className="sidebar-section">
      <p>Instructor</p>

      <SidebarLink to="/instructor" icon="🏠" label="Overview" />
      <SidebarLink to="/announcements" icon="📢" label="Announcements" />
      <SidebarLink to="/instructor/courses" icon="📚" label="My Courses" />
      <SidebarLink
        to="/instructor/curriculum"
        icon="🧩"
        label="Curriculum"
      />
      <SidebarLink to="/instructor/quizzes" icon="📝" label="Quizzes" />
      <SidebarLink to="/instructor/students" icon="👥" label="Students" />
      <SidebarLink to="/instructor/analytics" icon="📊" label="Analytics" />
    </div>
  </>
)}

   {isAuthenticated && isStudent && (
  <div className="sidebar-group">
    <p className="sidebar-group-title">LEARNING</p>

    <SidebarLink to="/dashboard" icon="📊" label="Overview" />

    <SidebarLink to="/announcements" icon="📢" label="Announcements" />

    <SidebarLink to="/dashboard/courses" icon="🎯" label="My Courses" />

    <SidebarLink to="/dashboard/quizzes" icon="📝" label="Quiz Results" />

      <SidebarLink to="/dashboard/certificates" icon="🏆" label="Certificates" />

      <SidebarLink to="/dashboard/profile" icon="👤" label="Profile" />

    <SidebarLink to="/courses" icon="▶️" label="Browse Courses" />
  </div>
)}

       {isAuthenticated && isAdmin && (
  <div className="sidebar-group">
    <p className="sidebar-group-title">ADMIN MANAGEMENT</p>

    <SidebarLink to="/admin" icon="📌" label="Overview" />

    <SidebarLink to="/announcements" icon="📢" label="Announcements" />

    <SidebarLink to="/admin/students" icon="👥" label="Students" />

    <SidebarLink to="/admin/instructors" icon="🧑‍🏫" label="Instructors" />

    <SidebarLink to="/admin/courses" icon="📘" label="Courses" />

    <SidebarLink to="/admin/curriculum" icon="🧩" label="Curriculum" />

    <SidebarLink to="/admin/quizzes" icon="🧠" label="Quiz Builder" />

    <SidebarLink to="/admin/certificates" icon="🏆" label="Certificates"/>

    <SidebarLink to="/admin/analytics" icon="📈" label="Analytics"/>

    <SidebarLink to="/admin/library" icon="🗂️" label="Course Library" />
  </div>
)}


      </nav>

      <div className="sidebar-footer">
        {isAuthenticated && user ? (
          <>
            <div className="sidebar-user-card">
              <div className="sidebar-user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{user.name}</strong>
                <p>{user.role}</p>
              </div>
            </div>

            <button type="button" className="sidebar-logout-button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <div className="sidebar-auth-buttons">
            <NavLink to="/login" className="sidebar-login-link">
              Login
            </NavLink>

            <NavLink to="/register" className="sidebar-register-link">
              Register
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Navbar;