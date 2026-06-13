import { Link } from "react-router-dom";

import BackendStatus from "../components/BackendStatus";
import { useAuth } from "../context/AuthContext";

function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-heading">
          <p className="small-heading">STUDENT DASHBOARD</p>
          <h1>Please login first</h1>
          <p>Your personalised dashboard will appear after login.</p>
        </div>

        <BackendStatus />

        <div className="auth-info-card">
          <div>
            <p className="small-heading">NOT LOGGED IN</p>
            <h2>Login to track your learning progress.</h2>
            <p>
              After login, you will see enrolled courses, completed lessons and
              progress details.
            </p>
          </div>

          <Link to="/login" className="course-link dashboard-login-link">
            Login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-heading">
        <p className="small-heading">STUDENT DASHBOARD</p>
        <h1>Welcome back, {user.name}</h1>
        <p>Continue learning and monitor your progress.</p>
      </div>

      <BackendStatus />

      <div className="auth-info-card">
        <div>
          <p className="small-heading">LOGGED IN ACCOUNT</p>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <p>Role: {user.role}</p>
        </div>

        <button type="button" className="logout-button" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <p>Enrolled Courses</p>
          <h2>4</h2>
        </div>

        <div className="dashboard-card">
          <p>Completed Lessons</p>
          <h2>6</h2>
        </div>

        <div className="dashboard-card">
          <p>Overall Progress</p>
          <h2>60%</h2>
        </div>
      </div>

      <div className="continue-card">
        <div>
          <p className="small-heading">CONTINUE LEARNING</p>
          <h2>React Basics</h2>
          <p>You have completed 6 out of 10 lessons.</p>
        </div>

        <button className="primary-button">Continue Course</button>
      </div>
    </section>
  );
}

export default DashboardPage;