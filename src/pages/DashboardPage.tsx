import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { fetchDashboardData } from "../api/dashboardApi";
import BackendStatus from "../components/BackendStatus";
import { useAuth } from "../context/AuthContext";
import type { DashboardData } from "../types/dashboard";

function DashboardPage() {
  const { user, token, logout } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    async function loadDashboard() {
      if (isAdmin) {
        setIsLoading(false);
        return;
      }

      if (!token) {
        setErrorMessage("Login token is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchDashboardData(token);
        setDashboardData(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [token, isAdmin]);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-heading">
        <p className="small-heading">STUDENT OVERVIEW</p>
        <h1>Welcome back, {user?.name || "Student"}</h1>
        <p>Your learning progress, current course and quick actions.</p>
      </div>

      <BackendStatus />

      <div className="auth-info-card">
        <div>
          <p className="small-heading">LOGGED IN ACCOUNT</p>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <p>Role: {user?.role}</p>
        </div>

        <button type="button" className="logout-button" onClick={logout}>
          Logout
        </button>
      </div>

      {isLoading && <p className="status-text">Loading dashboard...</p>}

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && !errorMessage && dashboardData && (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <p>Enrolled Courses</p>
              <h2>{dashboardData.enrolledCourses}</h2>
            </div>

            <div className="dashboard-card">
              <p>Overall Progress</p>
              <h2>{dashboardData.overallProgress}%</h2>
            </div>

            <div className="dashboard-card">
              <p>Average Quiz Score</p>
              <h2>{dashboardData.quizAnalytics.averageScore}%</h2>
            </div>
          </div>

          {dashboardData.continueLearning ? (
            <div className="continue-card">
              <div>
                <p className="small-heading">CONTINUE LEARNING</p>
                <h2>{dashboardData.continueLearning.title}</h2>
                <p>
                  You have completed{" "}
                  {dashboardData.continueLearning.completedLessons} out of{" "}
                  {dashboardData.continueLearning.totalLessons} lessons.
                </p>
              </div>

              <Link
                to={`/courses/${dashboardData.continueLearning.id}`}
                className="course-link dashboard-login-link"
              >
                Continue Course
              </Link>
            </div>
          ) : (
            <div className="empty-dashboard-card">
              <h2>No courses started yet</h2>
              <p>Open a course and complete lessons to start learning.</p>

              <Link to="/courses" className="course-link dashboard-login-link">
                Browse Courses
              </Link>
            </div>
          )}

          <div className="admin-overview-actions">
            <Link to="/dashboard/courses" className="admin-overview-card">
              <span>🎯</span>
              <h3>My Courses</h3>
              <p>View course-wise progress and continue learning.</p>
            </Link>

            <Link to="/dashboard/quizzes" className="admin-overview-card">
              <span>📝</span>
              <h3>Quiz Results</h3>
              <p>Review quiz attempts, scores and pass/fail status.</p>
            </Link>

            <Link to="/courses" className="admin-overview-card">
              <span>📚</span>
              <h3>Browse Courses</h3>
              <p>Explore all available learning content.</p>
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

export default DashboardPage;