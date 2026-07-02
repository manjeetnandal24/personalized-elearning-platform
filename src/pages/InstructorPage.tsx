import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  fetchInstructorOverview,
  type InstructorOverview,
} from "../api/instructorApi";
import { useAuth } from "../context/AuthContext";

function InstructorPage() {
  const { user, token } = useAuth();

  const [overview, setOverview] = useState<InstructorOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadInstructorOverview() {
      if (!token) {
        setErrorMessage("Instructor token is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchInstructorOverview(token);
        setOverview(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load instructor dashboard.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadInstructorOverview();
  }, [token]);

  const stats = overview?.stats;

  return (
    <section className="admin-page">
      <div className="admin-hero-card instructor-hero-card">
        <div>
          <p className="small-heading">INSTRUCTOR DASHBOARD</p>
          <h1>Welcome, {user?.name || "Instructor"}</h1>
          <p>
            Manage your assigned courses, curriculum, quizzes, students and
            learning performance from one place.
          </p>
        </div>
      </div>

      {isLoading && <p className="status-text">Loading instructor dashboard...</p>}

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && !errorMessage && stats && (
        <>
          <div className="admin-stats-grid">
            <div className="dashboard-card">
              <p>My Courses</p>
              <h2>{stats.coursesCount}</h2>
              <span>Assigned courses</span>
            </div>

            <div className="dashboard-card">
              <p>My Students</p>
              <h2>{stats.studentsCount}</h2>
              <span>Students enrolled</span>
            </div>

            <div className="dashboard-card">
              <p>Quiz Attempts</p>
              <h2>{stats.quizAttemptsCount}</h2>
              <span>Across your courses</span>
            </div>

            <div className="dashboard-card">
              <p>Avg Quiz Score</p>
              <h2>{stats.averageQuizScore}%</h2>
              <span>Student performance</span>
            </div>

            <div className="dashboard-card">
              <p>Avg Progress</p>
              <h2>{stats.averageProgress}%</h2>
              <span>Course completion</span>
            </div>

            <div className="dashboard-card">
              <p>Certificates</p>
              <h2>{stats.certificatesCount}</h2>
              <span>Issued certificates</span>
            </div>
          </div>

          <div className="instructor-action-grid">
            <Link to="/instructor/courses" className="instructor-action-card">
              <span>📚</span>
              <h2>My Courses</h2>
              <p>View and manage courses assigned to you.</p>
            </Link>

            <Link
              to="/instructor/curriculum"
              className="instructor-action-card"
            >
              <span>🧩</span>
              <h2>Curriculum</h2>
              <p>Add topics and lessons for your courses.</p>
            </Link>

            <Link to="/instructor/quizzes" className="instructor-action-card">
              <span>📝</span>
              <h2>Quizzes</h2>
              <p>Create and manage quizzes for your courses.</p>
            </Link>

            <Link to="/instructor/students" className="instructor-action-card">
              <span>👥</span>
              <h2>Students</h2>
              <p>Track students enrolled in your courses.</p>
            </Link>

            <Link
              to="/instructor/analytics"
              className="instructor-action-card"
            >
              <span>📊</span>
              <h2>Analytics</h2>
              <p>See progress, quiz scores and course performance.</p>
            </Link>
          </div>

          <div className="instructor-course-section">
            <div className="section-heading-row">
              <div>
                <p className="small-heading">ASSIGNED COURSES</p>
                <h2>My Courses Overview</h2>
              </div>

              <Link to="/instructor/courses" className="secondary-button">
                View All
              </Link>
            </div>

            {overview.courses.length === 0 ? (
              <div className="empty-dashboard-card">
                <h2>No courses assigned yet</h2>
                <p>
                  Ask the admin to assign courses to your instructor account.
                </p>
              </div>
            ) : (
              <div className="instructor-course-grid">
                {overview.courses.map((course) => (
                  <article className="instructor-course-card" key={course.id}>
                    <div className="course-icon">{course.shortName}</div>

                    <div>
                      <p className="course-category-pill">{course.category}</p>
                      <h3>{course.title}</h3>
                      <p>{course.description}</p>
                    </div>

                    <div className="instructor-course-meta">
                      <span>{course.level}</span>
                      <span>{course.lessonsCount} lessons</span>
                      <span>{course.enrollmentsCount} students</span>
                      <span>{course.quizzesCount} quizzes</span>
                    </div>

                    <Link
                      to={`/courses/${course.id}`}
                      className="primary-button instructor-course-button"
                    >
                      Open Course
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default InstructorPage;