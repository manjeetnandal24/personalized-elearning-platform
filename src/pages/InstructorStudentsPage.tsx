import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  fetchInstructorStudents,
  type InstructorStudentCourseGroup,
  type InstructorStudentsOverview,
} from "../api/instructorApi";
import { useAuth } from "../context/AuthContext";

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function InstructorStudentsPage() {
  const { token } = useAuth();

  const [overview, setOverview] = useState<InstructorStudentsOverview | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadStudents() {
    if (!token) {
      setErrorMessage("Instructor token is missing.");
      setIsLoading(false);
      return;
    }

    try {
      setErrorMessage("");
      const data = await fetchInstructorStudents(token);
      setOverview(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load instructor students.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadStudents();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredCourses = useMemo(() => {
    if (!overview) {
      return [];
    }

    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (!normalizedSearch) {
      return overview.courses;
    }

    return overview.courses
      .map((course) => {
        const courseMatches =
          course.courseTitle.toLowerCase().includes(normalizedSearch) ||
          course.courseShortName.toLowerCase().includes(normalizedSearch) ||
          course.courseCategory.toLowerCase().includes(normalizedSearch) ||
          course.courseLevel.toLowerCase().includes(normalizedSearch);

        const filteredStudents = course.students.filter((student) => {
          return (
            student.name.toLowerCase().includes(normalizedSearch) ||
            student.email.toLowerCase().includes(normalizedSearch)
          );
        });

        if (courseMatches) {
          return course;
        }

        return {
          ...course,
          students: filteredStudents,
        };
      })
      .filter((course) => course.students.length > 0);
  }, [overview, searchQuery]);

  const stats = overview?.stats;

  return (
    <section className="admin-page">
      <div className="admin-hero-card instructor-hero-card">
        <div>
          <p className="small-heading">INSTRUCTOR STUDENTS</p>
          <h1>My Students</h1>
          <p>
            Track students enrolled in your assigned courses, including progress,
            quiz performance and certificates.
          </p>
        </div>
      </div>

      {isLoading && <p className="status-text">Loading students...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && !errorMessage && stats && overview && (
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
              <span>Across your courses</span>
            </div>

            <div className="dashboard-card">
              <p>Total Enrollments</p>
              <h2>{stats.totalEnrollments}</h2>
              <span>Course enrollments</span>
            </div>

            <div className="dashboard-card">
              <p>Quiz Attempts</p>
              <h2>{stats.quizAttempts}</h2>
              <span>Student attempts</span>
            </div>

            <div className="dashboard-card">
              <p>Certificates</p>
              <h2>{stats.certificates}</h2>
              <span>Earned certificates</span>
            </div>

            <div className="dashboard-card">
              <p>Avg Progress</p>
              <h2>{stats.averageProgress}%</h2>
              <span>Lesson completion</span>
            </div>
          </div>

          <div className="student-management-toolbar">
            <label>
              Search Students
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by student, email, course, category..."
              />
            </label>

            <p>
              Showing <strong>{filteredCourses.length}</strong> course groups
            </p>
          </div>

          {overview.courses.length === 0 ? (
            <div className="empty-dashboard-card">
              <h2>No assigned courses yet</h2>
              <p>Ask the admin to assign courses to your instructor account.</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="empty-dashboard-card">
              <h2>No students found</h2>
              <p>Try searching with a different student name, email or course.</p>
            </div>
          ) : (
            <div className="instructor-student-course-list">
              {filteredCourses.map((course: InstructorStudentCourseGroup) => (
                <article
                  className="instructor-student-course-card"
                  key={course.courseId}
                >
                  <div className="instructor-student-course-header">
                    <div className="course-icon">{course.courseShortName}</div>

                    <div>
                      <p className="course-category-pill">
                        {course.courseCategory}
                      </p>
                      <h2>{course.courseTitle}</h2>
                      <p>
                        {course.courseLevel} • {course.totalLessons} lessons •{" "}
                        {course.students.length} students
                      </p>
                    </div>

                    <Link
                      to={`/courses/${course.courseId}`}
                      className="secondary-button instructor-course-button"
                    >
                      Open Course
                    </Link>
                  </div>

                  {course.students.length === 0 ? (
                    <p className="status-text left-status-text">
                      No students enrolled in this course yet.
                    </p>
                  ) : (
                    <div className="instructor-student-list">
                      {course.students.map((student) => (
                        <article
                          className="instructor-student-card"
                          key={`${course.courseId}-${student.id}`}
                        >
                          <div className="instructor-student-main">
                            <div className="profile-avatar-large small-student-avatar">
                              {student.name.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <h3>{student.name}</h3>
                              <p>{student.email}</p>
                              <small>
                                Enrolled: {formatDate(student.enrolledAt)}
                              </small>
                            </div>
                          </div>

                          <div className="instructor-student-metrics">
                            <div>
                              <p>Progress</p>
                              <strong>{student.progressPercentage}%</strong>
                            </div>

                            <div>
                              <p>Lessons</p>
                              <strong>
                                {student.completedLessons}/{student.totalLessons}
                              </strong>
                            </div>

                            <div>
                              <p>Quiz Attempts</p>
                              <strong>{student.quizAttempts}</strong>
                            </div>

                            <div>
                              <p>Passed</p>
                              <strong>{student.passedQuizAttempts}</strong>
                            </div>

                            <div>
                              <p>Avg Score</p>
                              <strong>{student.averageQuizScore}%</strong>
                            </div>

                            <div>
                              <p>Certificate</p>
                              <strong>
                                {student.certificateEarned ? "Earned" : "No"}
                              </strong>
                            </div>
                          </div>

                          <div className="mini-progress-bar">
                            <div
                              className="mini-progress-fill"
                              style={{
                                width: `${student.progressPercentage}%`,
                              }}
                            />
                          </div>

                          {student.certificateEarned &&
                            student.certificate && (
                              <div className="instructor-certificate-note">
                                🏆 Certificate:{" "}
                                <strong>
                                  {student.certificate.certificateCode}
                                </strong>
                              </div>
                            )}
                        </article>
                      ))}
                    </div>
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

export default InstructorStudentsPage;