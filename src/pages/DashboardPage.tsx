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
        <p className="small-heading">STUDENT DASHBOARD</p>
        <h1>Welcome back, {user?.name || "Student"}</h1>
        <p>Continue learning and monitor your real progress.</p>
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
              <p>Completed Lessons</p>
              <h2>{dashboardData.completedLessons}</h2>
            </div>

            <div className="dashboard-card">
              <p>Overall Progress</p>
              <h2>{dashboardData.overallProgress}%</h2>
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
              <p>
                Open a course and complete lessons to see your dashboard data.
              </p>

              <Link to="/courses" className="course-link dashboard-login-link">
                Browse Courses
              </Link>
            </div>
          )}

          <div className="quiz-dashboard-section">
            <div className="lessons-heading">
              <h2>Quiz Performance</h2>
              <p>Your quiz attempts and assessment results.</p>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <p>Quiz Attempts</p>
                <h2>{dashboardData.quizAnalytics.totalAttempts}</h2>
              </div>

              <div className="dashboard-card">
                <p>Average Score</p>
                <h2>{dashboardData.quizAnalytics.averageScore}%</h2>
              </div>

              <div className="dashboard-card">
                <p>Passed Attempts</p>
                <h2>{dashboardData.quizAnalytics.passedAttempts}</h2>
              </div>
            </div>

            {dashboardData.quizAnalytics.totalAttempts === 0 ? (
              <div className="empty-dashboard-card">
                <h2>No quiz attempts yet</h2>
                <p>
                  Attempt a course quiz to see your quiz performance here.
                </p>

                <Link to="/courses" className="course-link dashboard-login-link">
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="recent-quiz-panel">
                <div className="lessons-heading">
                  <h2>Recent Quiz Results</h2>
                  <p>Your latest quiz attempts from PostgreSQL.</p>
                </div>

                {dashboardData.quizAnalytics.recentAttempts.map((attempt) => (
                  <Link
                    to={`/courses/${attempt.courseId}`}
                    className="recent-quiz-row"
                    key={attempt.id}
                  >
                    <div className="course-icon">{attempt.courseShortName}</div>

                    <div className="recent-quiz-info">
                      <h3>{attempt.quizTitle}</h3>
                      <p>
                        {attempt.courseTitle}
                        {attempt.topicTitle ? ` • ${attempt.topicTitle}` : ""}
                      </p>
                      <p>
                        Correct answers: {attempt.correctAnswers}/
                        {attempt.totalQuestions}
                      </p>
                    </div>

                    <div
                      className={
                        attempt.passed
                          ? "quiz-status-pill passed-pill"
                          : "quiz-status-pill failed-pill"
                      }
                    >
                      <strong>{attempt.score}%</strong>
                      <span>{attempt.passed ? "Passed" : "Failed"}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {dashboardData.courses.length > 0 && (
            <div className="dashboard-course-list">
              <div className="lessons-heading">
                <h2>Your Courses</h2>
                <p>Course-wise learning progress from your database.</p>
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

export default DashboardPage;