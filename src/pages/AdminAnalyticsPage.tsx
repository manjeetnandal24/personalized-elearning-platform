import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  fetchAdminAnalytics,
  type AdminAnalyticsData,
  type AdminCourseAnalytics,
} from "../api/adminAnalyticsApi";
import { useAuth } from "../context/AuthContext";

function HighlightCard({
  title,
  course,
  metric,
  emptyText,
}: {
  title: string;
  course: AdminCourseAnalytics | null;
  metric: string;
  emptyText: string;
}) {
  return (
    <div className="admin-highlight-card">
      <p className="small-heading">{title}</p>

      {course ? (
        <>
          <h3>{course.title}</h3>
          <p>{metric}</p>
        </>
      ) : (
        <>
          <h3>No data yet</h3>
          <p>{emptyText}</p>
        </>
      )}
    </div>
  );
}

function AdminAnalyticsPage() {
  const { token } = useAuth();

  const [analyticsData, setAnalyticsData] =
    useState<AdminAnalyticsData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      if (!token) {
        setErrorMessage("Admin token is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchAdminAnalytics(token);
        setAnalyticsData(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load admin analytics.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalytics();
  }, [token]);

  return (
    <section className="admin-page">
      <div className="admin-hero-card">
        <div>
          <p className="small-heading">ADMIN ANALYTICS</p>
          <h1>Platform Analytics</h1>
          <p>
            Track students, enrollments, certificates, quizzes and course-wise
            performance.
          </p>
        </div>
      </div>

      {isLoading && <p className="status-text">Loading analytics...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && !errorMessage && analyticsData && (
        <>
          <div className="admin-stats-grid">
            <div className="dashboard-card">
              <p>Total Students</p>
              <h2>{analyticsData.totals.totalStudents}</h2>
            </div>

            <div className="dashboard-card">
              <p>Total Courses</p>
              <h2>{analyticsData.totals.totalCourses}</h2>
            </div>

            <div className="dashboard-card">
              <p>Total Enrollments</p>
              <h2>{analyticsData.totals.totalEnrollments}</h2>
            </div>

            <div className="dashboard-card">
              <p>Certificates Issued</p>
              <h2>{analyticsData.totals.totalCertificates}</h2>
            </div>

            <div className="dashboard-card">
              <p>Quiz Attempts</p>
              <h2>{analyticsData.totals.totalQuizAttempts}</h2>
            </div>

            <div className="dashboard-card">
              <p>Average Quiz Score</p>
              <h2>{analyticsData.totals.averageQuizScore}%</h2>
            </div>
          </div>

          <div className="admin-highlights-grid">
            <HighlightCard
              title="TOP ENROLLED COURSE"
              course={analyticsData.highlights.topEnrollmentCourse}
              metric={`${analyticsData.highlights.topEnrollmentCourse?.enrollments || 0} enrollments`}
              emptyText="No course enrollments yet."
            />

            <HighlightCard
              title="TOP CERTIFICATE COURSE"
              course={analyticsData.highlights.topCertificateCourse}
              metric={`${analyticsData.highlights.topCertificateCourse?.certificatesIssued || 0} certificates issued`}
              emptyText="No certificates issued yet."
            />

            <HighlightCard
              title="MOST ATTEMPTED QUIZ COURSE"
              course={analyticsData.highlights.topQuizCourse}
              metric={`${analyticsData.highlights.topQuizCourse?.quizAttempts || 0} quiz attempts`}
              emptyText="No quiz attempts yet."
            />
          </div>

          <div className="admin-course-panel">
            <div className="lessons-heading">
              <h2>Course-wise Analytics</h2>
              <p>Detailed analytics for each course.</p>
            </div>

            {analyticsData.courses.length === 0 ? (
              <div className="empty-dashboard-card">
                <h2>No courses yet</h2>
                <p>Create courses first to see analytics.</p>

                <Link to="/admin/courses" className="course-link">
                  Add Course
                </Link>
              </div>
            ) : (
              <div className="analytics-table-wrapper">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Level</th>
                      <th>Enrollments</th>
                      <th>Certificates</th>
                      <th>Lessons</th>
                      <th>Topics</th>
                      <th>Quizzes</th>
                      <th>Quiz Attempts</th>
                      <th>Passed Attempts</th>
                      <th>Avg Score</th>
                    </tr>
                  </thead>

                  <tbody>
                    {analyticsData.courses.map((course) => (
                      <tr key={course.id}>
                        <td>
                          <div className="analytics-course-cell">
                            <div className="course-icon">{course.shortName}</div>

                            <div>
                              <strong>{course.title}</strong>
                              <p>{course.instructor}</p>
                            </div>
                          </div>
                        </td>

                        <td>{course.level}</td>
                        <td>{course.enrollments}</td>
                        <td>{course.certificatesIssued}</td>
                        <td>{course.lessons}</td>
                        <td>{course.topics}</td>
                        <td>{course.quizzes}</td>
                        <td>{course.quizAttempts}</td>
                        <td>{course.passedQuizAttempts}</td>
                        <td>{course.averageQuizScore}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default AdminAnalyticsPage;