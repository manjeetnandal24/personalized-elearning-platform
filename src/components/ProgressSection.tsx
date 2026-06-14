import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchDashboardData } from "../api/dashboardApi";
import { useAuth } from "../context/AuthContext";
import type { DashboardData } from "../types/dashboard";

function ProgressSection() {
  const { isAuthenticated, token } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProgress() {
      if (!isAuthenticated || !token) {
        setDashboardData(null);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await fetchDashboardData(token);

        setDashboardData(data);
      } catch {
        setErrorMessage("Unable to load your progress.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProgress();
  }, [isAuthenticated, token]);

  const continueCourse = dashboardData?.continueLearning;

  return (
    <section className="progress-section">
      <div className="section-heading">
        <h2>Your Learning Progress</h2>
        <p>Track how much you have completed.</p>
      </div>

      {!isAuthenticated && (
        <div className="progress-card">
          <h3>Login to view your real progress</h3>
          <p>
            Your course progress will appear here after you login and complete
            lessons.
          </p>

          <Link to="/login" className="primary-link hero-link">
            Login
          </Link>
        </div>
      )}

      {isAuthenticated && isLoading && (
        <p className="status-text">Loading your progress...</p>
      )}

      {isAuthenticated && errorMessage && (
        <p className="error-text">{errorMessage}</p>
      )}

      {isAuthenticated && !isLoading && !errorMessage && dashboardData && (
        <>
          {continueCourse ? (
            <div className="progress-card">
              <h3>{continueCourse.title}</h3>

              <p>
                Completed {continueCourse.completedLessons} out of{" "}
                {continueCourse.totalLessons} lessons
              </p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${continueCourse.progressPercentage}%` }}
                />
              </div>

              <strong>{continueCourse.progressPercentage}% Completed</strong>

              <br />

              <Link
                to={`/courses/${continueCourse.id}`}
                className="primary-link hero-link"
              >
                Continue Course
              </Link>
            </div>
          ) : (
            <div className="progress-card">
              <h3>No course progress yet</h3>
              <p>
                Open any course and complete lessons to start tracking your real
                progress.
              </p>

              <Link to="/courses" className="primary-link hero-link">
                Browse Courses
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ProgressSection;
