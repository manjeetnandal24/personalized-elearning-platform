import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { fetchDashboardData } from "../api/dashboardApi";
import BackendStatus from "../components/BackendStatus";
import { useAuth } from "../context/AuthContext";
import type { DashboardData } from "../types/dashboard";

function StudentCoursesPage() {
  const { user, token } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    async function loadCourses() {
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
            : "Unable to load your courses.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, [token, isAdmin]);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-heading">
        <p className="small-heading">MY COURSES</p>
        <h1>My Learning Courses</h1>
        <p>Track course-wise lesson completion and continue learning.</p>
      </div>

      <BackendStatus />

      {isLoading && <p className="status-text">Loading your courses...</p>}

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && !errorMessage && dashboardData && (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <p>Enrolled Courses</p>
              <h2>{dashboardData.enrolledCourses}</h2>
            </div>

            <div className="dashboard-card">
              <p>Completed Lessons</p>
              <h2>{dashboardData.completedLessons}</h2>
            </div>

            <div className="dashboard-card">
              <p>Overall Progress</p>
              <h2>{dashboardData.overallProgress}%</h2>
            </div>
          </div>

          {dashboardData.courses.length === 0 ? (
            <div className="empty-dashboard-card">
              <h2>No courses started yet</h2>
              <p>
                Open a course and complete lessons to start tracking progress.
              </p>

              <Link to="/courses" className="course-link dashboard-login-link">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="dashboard-course-list">
              <div className="lessons-heading">
                <h2>Course Progress</h2>
                <p>Your course-wise progress from PostgreSQL.</p>
              </div>

              {dashboardData.courses.map((course) => (
                <Link
                  to={`/courses/${course.id}`}
                  className="dashboard-course-row"
                  key={course.id}
                >
                  <div className="course-icon">{course.shortName}</div>

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

export default StudentCoursesPage;