import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { fetchDashboardData } from "../api/dashboardApi";
import BackendStatus from "../components/BackendStatus";
import { useAuth } from "../context/AuthContext";
import type { DashboardData } from "../types/dashboard";

function StudentQuizResultsPage() {
  const { user, token } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    async function loadQuizResults() {
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
            : "Unable to load quiz results.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadQuizResults();
  }, [token, isAdmin]);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-heading">
        <p className="small-heading">QUIZ RESULTS</p>
        <h1>Quiz Performance</h1>
        <p>Review your quiz attempts, average score and pass/fail status.</p>
      </div>

      <BackendStatus />

      {isLoading && <p className="status-text">Loading quiz results...</p>}

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && !errorMessage && dashboardData && (
        <>
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

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <p>Unique Quizzes Attempted</p>
              <h2>{dashboardData.quizAnalytics.uniqueQuizzesAttempted}</h2>
            </div>

            <div className="dashboard-card">
              <p>Failed Attempts</p>
              <h2>{dashboardData.quizAnalytics.failedAttempts}</h2>
            </div>

            <div className="dashboard-card">
              <p>Total Attempts</p>
              <h2>{dashboardData.quizAnalytics.totalAttempts}</h2>
            </div>
          </div>

          {dashboardData.quizAnalytics.totalAttempts === 0 ? (
            <div className="empty-dashboard-card">
              <h2>No quiz attempts yet</h2>
              <p>Attempt a quiz from any course to see results here.</p>

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
        </>
      )}
    </section>
  );
}

export default StudentQuizResultsPage;