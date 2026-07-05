import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  fetchInstructorAnalytics,
  type InstructorAnalyticsOverview,
} from "../api/instructorApi";
import { useAuth } from "../context/AuthContext";

function InstructorAnalyticsPage() {
  const { token } = useAuth();

  const [analytics, setAnalytics] =
    useState<InstructorAnalyticsOverview | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadAnalytics() {
    if (!token) {
      setErrorMessage("Instructor token is missing.");
      setIsLoading(false);
      return;
    }

    try {
      setErrorMessage("");
      const data = await fetchInstructorAnalytics(token);
      setAnalytics(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load instructor analytics.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAnalytics();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredCourses = useMemo(() => {
    if (!analytics) {
      return [];
    }

    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (!normalizedSearch) {
      return analytics.courseAnalytics;
    }

    return analytics.courseAnalytics.filter((course) => {
      return (
        course.courseTitle.toLowerCase().includes(normalizedSearch) ||
        course.courseShortName.toLowerCase().includes(normalizedSearch) ||
        course.courseCategory.toLowerCase().includes(normalizedSearch) ||
        course.courseLevel.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [analytics, searchQuery]);

  const stats = analytics?.stats;

  return (
    <section className="admin-page">
      <div className="admin-hero-card instructor-hero-card">
        <div>
          <p className="small-heading">INSTRUCTOR ANALYTICS</p>
          <h1>Course Performance</h1>
          <p>
            Track enrollments, progress, quiz performance, pass rate and
            certificates across your assigned courses.
          </p>
        </div>
      </div>

      {isLoading && <p className="status-text">Loading analytics...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && !errorMessage && stats && analytics && (
        <>
          <div className="admin-stats-grid">
            <div className="dashboard-card">
              <p>Assigned Courses</p>
              <h2>{stats.assignedCourses}</h2>
              <span>Your courses</span>
            </div>

            <div className="dashboard-card">
              <p>Unique Students</p>
              <h2>{stats.uniqueStudents}</h2>
              <span>Across courses</span>
            </div>

            <div className="dashboard-card">
              <p>Total Enrollments</p>
              <h2>{stats.totalEnrollments}</h2>
              <span>Course enrollments</span>
            </div>

            <div className="dashboard-card">
              <p>Total Lessons</p>
              <h2>{stats.totalLessons}</h2>
              <span>Learning content</span>
            </div>

            <div className="dashboard-card">
              <p>Quiz Attempts</p>
              <h2>{stats.quizAttempts}</h2>
              <span>Student attempts</span>
            </div>

            <div className="dashboard-card">
              <p>Avg Quiz Score</p>
              <h2>{stats.averageQuizScore}%</h2>
              <span>Performance</span>
            </div>

            <div className="dashboard-card">
              <p>Pass Rate</p>
              <h2>{stats.passRate}%</h2>
              <span>Quiz success</span>
            </div>

            <div className="dashboard-card">
              <p>Avg Progress</p>
              <h2>{stats.averageProgress}%</h2>
              <span>Lesson completion</span>
            </div>

            <div className="dashboard-card">
              <p>Certificates</p>
              <h2>{stats.certificates}</h2>
              <span>Earned certificates</span>
            </div>
          </div>

          <div className="instructor-analytics-highlight-grid">
            <div className="instructor-analytics-panel">
              <div className="section-heading-row">
                <div>
                  <p className="small-heading">TOP PROGRESS</p>
                  <h2>Best Course Progress</h2>
                </div>
              </div>

              {analytics.topProgressCourses.length === 0 ? (
                <p className="status-text left-status-text">
                  No progress data available yet.
                </p>
              ) : (
                <div className="analytics-mini-list">
                  {analytics.topProgressCourses.map((course) => (
                    <div className="analytics-mini-row" key={course.courseId}>
                      <div>
                        <strong>{course.courseTitle}</strong>
                        <p>{course.studentsCount} students</p>
                      </div>

                      <span>{course.averageProgress}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="instructor-analytics-panel">
              <div className="section-heading-row">
                <div>
                  <p className="small-heading">TOP QUIZ SCORE</p>
                  <h2>Best Quiz Performance</h2>
                </div>
              </div>

              {analytics.topQuizCourses.length === 0 ? (
                <p className="status-text left-status-text">
                  No quiz data available yet.
                </p>
              ) : (
                <div className="analytics-mini-list">
                  {analytics.topQuizCourses.map((course) => (
                    <div className="analytics-mini-row" key={course.courseId}>
                      <div>
                        <strong>{course.courseTitle}</strong>
                        <p>{course.quizAttemptsCount} attempts</p>
                      </div>

                      <span>{course.averageQuizScore}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="student-management-toolbar">
            <label>
              Search Courses
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by course, short name, category or level..."
              />
            </label>

            <p>
              Showing <strong>{filteredCourses.length}</strong> of{" "}
              <strong>{analytics.courseAnalytics.length}</strong> courses
            </p>
          </div>

          {analytics.courseAnalytics.length === 0 ? (
            <div className="empty-dashboard-card">
              <h2>No assigned courses yet</h2>
              <p>Ask the admin to assign courses to your instructor account.</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="empty-dashboard-card">
              <h2>No courses found</h2>
              <p>Try searching with another course name or category.</p>
            </div>
          ) : (
            <div className="instructor-analytics-table-card">
              <div className="responsive-table-wrapper">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Students</th>
                      <th>Lessons</th>
                      <th>Quizzes</th>
                      <th>Attempts</th>
                      <th>Avg Score</th>
                      <th>Pass Rate</th>
                      <th>Progress</th>
                      <th>Certificates</th>
                      <th>Open</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.courseId}>
                        <td>
                          <div className="analytics-course-cell">
                            <div className="course-icon">
                              {course.courseShortName}
                            </div>

                            <div>
                              <strong>{course.courseTitle}</strong>
                              <p>
                                {course.courseLevel} • {course.courseCategory}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td>{course.studentsCount}</td>
                        <td>{course.lessonsCount}</td>
                        <td>{course.quizzesCount}</td>
                        <td>{course.quizAttemptsCount}</td>
                        <td>{course.averageQuizScore}%</td>
                        <td>{course.passRate}%</td>
                        <td>
                          <div className="analytics-progress-cell">
                            <strong>{course.averageProgress}%</strong>
                            <div className="mini-progress-bar">
                              <div
                                className="mini-progress-fill"
                                style={{
                                  width: `${course.averageProgress}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>{course.certificatesCount}</td>
                        <td>
                          <Link
                            to={`/courses/${course.courseId}`}
                            className="secondary-button compact-action-button"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default InstructorAnalyticsPage;