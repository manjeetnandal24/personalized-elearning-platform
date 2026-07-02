import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  fetchAdminStudents,
  type AdminStudent,
} from "../api/adminStudentsApi";
import { useAuth } from "../context/AuthContext";

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AdminStudentsPage() {
  const { token } = useAuth();

  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadStudents() {
      if (!token) {
        setErrorMessage("Admin token is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchAdminStudents(token);
        setStudents(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load students.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadStudents();
  }, [token]);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (!normalizedSearch) {
      return students;
    }

    return students.filter((student) => {
      const courseMatch = student.enrolledCourses.some((course) =>
        course.courseTitle.toLowerCase().includes(normalizedSearch),
      );

      return (
        student.name.toLowerCase().includes(normalizedSearch) ||
        student.email.toLowerCase().includes(normalizedSearch) ||
        courseMatch
      );
    });
  }, [students, searchQuery]);

  const totalEnrollments = students.reduce(
    (total, student) => total + student.enrolledCoursesCount,
    0,
  );

  const totalCertificates = students.reduce(
    (total, student) => total + student.certificatesCount,
    0,
  );

  const totalQuizAttempts = students.reduce(
    (total, student) => total + student.quizAttempts,
    0,
  );

  const averageScore =
    students.length === 0
      ? 0
      : Math.round(
          students.reduce(
            (total, student) => total + student.averageQuizScore,
            0,
          ) / students.length,
        );

  return (
    <section className="admin-page">
      <div className="admin-hero-card">
        <div>
          <p className="small-heading">STUDENT MANAGEMENT</p>
          <h1>Students</h1>
          <p>
            View all students, enrollments, course progress, quiz performance and
            certificates.
          </p>
        </div>
      </div>

      {isLoading && <p className="status-text">Loading students...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && !errorMessage && (
        <>
          <div className="admin-stats-grid">
            <div className="dashboard-card">
              <p>Total Students</p>
              <h2>{students.length}</h2>
            </div>

            <div className="dashboard-card">
              <p>Total Enrollments</p>
              <h2>{totalEnrollments}</h2>
            </div>

            <div className="dashboard-card">
              <p>Certificates Earned</p>
              <h2>{totalCertificates}</h2>
            </div>

            <div className="dashboard-card">
              <p>Quiz Attempts</p>
              <h2>{totalQuizAttempts}</h2>
            </div>

            <div className="dashboard-card">
              <p>Avg Student Score</p>
              <h2>{averageScore}%</h2>
            </div>
          </div>

          <div className="student-management-toolbar">
            <label>
              Search Students
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, email or course..."
              />
            </label>

            <p>
              Showing <strong>{filteredStudents.length}</strong> of{" "}
              <strong>{students.length}</strong> students
            </p>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="empty-dashboard-card">
              <h2>No students found</h2>
              <p>Try searching with a different name, email or course.</p>
            </div>
          ) : (
            <div className="admin-student-list">
              {filteredStudents.map((student) => (
                <article className="admin-student-card" key={student.id}>
                  <div className="admin-student-header">
                    <div className="admin-student-identity">
                      <div className="profile-avatar-large small-student-avatar">
                        {student.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h2>{student.name}</h2>
                        <p>{student.email}</p>
                        <small>Joined: {formatDate(student.joinedAt)}</small>
                      </div>
                    </div>

                    <div className="admin-student-badge">STUDENT</div>
                  </div>

                  <div className="student-mini-stats">
                    <div>
                      <p>Courses</p>
                      <strong>{student.enrolledCoursesCount}</strong>
                    </div>

                    <div>
                      <p>Lessons Done</p>
                      <strong>{student.completedLessonsCount}</strong>
                    </div>

                    <div>
                      <p>Quiz Attempts</p>
                      <strong>{student.quizAttempts}</strong>
                    </div>

                    <div>
                      <p>Passed Quizzes</p>
                      <strong>{student.passedQuizAttempts}</strong>
                    </div>

                    <div>
                      <p>Avg Score</p>
                      <strong>{student.averageQuizScore}%</strong>
                    </div>

                    <div>
                      <p>Certificates</p>
                      <strong>{student.certificatesCount}</strong>
                    </div>
                  </div>

                  <details className="student-details-panel">
                    <summary>View course-wise progress</summary>

                    {student.enrolledCourses.length === 0 ? (
                      <p className="status-text left-status-text">
                        This student has not enrolled in any course yet.
                      </p>
                    ) : (
                      <div className="student-course-progress-list">
                        {student.enrolledCourses.map((course) => (
                          <div
                            className="student-course-progress-card"
                            key={course.enrollmentId}
                          >
                            <div className="student-course-progress-top">
                              <div className="course-icon">
                                {course.courseShortName}
                              </div>

                              <div>
                                <h3>{course.courseTitle}</h3>
                                <p>
                                  {course.courseLevel} • {course.courseCategory}{" "}
                                  • Enrolled {formatDate(course.enrolledAt)}
                                </p>
                              </div>
                            </div>

                            <div className="student-course-progress-info">
                              <p>
                                {course.completedLessons} of{" "}
                                {course.totalLessons} lessons completed
                              </p>

                              <strong>{course.progressPercentage}%</strong>
                            </div>

                            <div className="mini-progress-bar">
                              <div
                                className="mini-progress-fill"
                                style={{
                                  width: `${course.progressPercentage}%`,
                                }}
                              />
                            </div>

                            <Link
                              to={`/courses/${course.courseId}`}
                              className="secondary-button student-course-link"
                            >
                              View Course
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </details>

                  {student.certificates.length > 0 && (
                    <details className="student-details-panel">
                      <summary>View certificates</summary>

                      <div className="student-certificate-list">
                        {student.certificates.map((certificate) => (
                          <div
                            className="student-certificate-row"
                            key={certificate.id}
                          >
                            <span>🏆</span>

                            <div>
                              <strong>{certificate.certificateCode}</strong>
                              <p>Issued: {formatDate(certificate.issuedAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default AdminStudentsPage;