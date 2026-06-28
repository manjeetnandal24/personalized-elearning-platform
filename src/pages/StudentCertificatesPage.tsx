import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchDashboardData } from "../api/dashboardApi";
import BackendStatus from "../components/BackendStatus";
import { useAuth } from "../context/AuthContext";
import type { DashboardData } from "../types/dashboard";

function StudentCertificatesPage() {
  const { token } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCertificates() {
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
            : "Unable to load certificate courses.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadCertificates();
  }, [token]);

  return (
    <section className="dashboard-page">
      <div className="dashboard-heading">
        <p className="small-heading">CERTIFICATES</p>
        <h1>My Certificates</h1>
        <p>View certificate eligibility and download unlocked certificates.</p>
      </div>

      <BackendStatus />

      {isLoading && <p className="status-text">Loading certificates...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && !errorMessage && dashboardData && (
        <>
          {dashboardData.courses.length === 0 ? (
            <div className="empty-dashboard-card">
              <h2>No enrolled courses yet</h2>
              <p>Enroll in a course first to unlock certificate tracking.</p>

              <Link to="/courses" className="course-link dashboard-login-link">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="dashboard-course-list">
              <div className="lessons-heading">
                <h2>Certificate Status</h2>
                <p>
                  Open a course certificate page to check requirements and
                  download when unlocked.
                </p>
              </div>

              {dashboardData.courses.map((course) => (
                <Link
                  to={`/certificates/courses/${course.id}`}
                  className="dashboard-course-row"
                  key={course.id}
                >
                  <div className="course-icon">🏆</div>

                  <div className="dashboard-course-info">
                    <h3>{course.title}</h3>
                    <p>
                      {course.completedLessons} of {course.totalLessons} lessons
                      completed
                    </p>

                    <div className="mini-progress-bar">
                      <div
                        className="mini-progress-fill"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <strong>{course.progressPercentage}%</strong>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default StudentCertificatesPage;