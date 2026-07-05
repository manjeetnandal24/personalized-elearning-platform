import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import {
  assignCourseInstructor,
  fetchAdminInstructors,
  updateUserInstructorRole,
  type AdminInstructorOverview,
} from "../api/adminInstructorsApi";
import { useAuth } from "../context/AuthContext";

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AdminInstructorsPage() {
  const { token } = useAuth();

  const [overview, setOverview] = useState<AdminInstructorOverview | null>(
    null,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedInstructorId, setSelectedInstructorId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadInstructors() {
    if (!token) {
      setErrorMessage("Admin token is missing.");
      setIsLoading(false);
      return;
    }

    try {
      setErrorMessage("");
      const data = await fetchAdminInstructors(token);
      setOverview(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load instructors.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadInstructors();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredInstructors = useMemo(() => {
    if (!overview) {
      return [];
    }

    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (!normalizedSearch) {
      return overview.instructors;
    }

    return overview.instructors.filter((instructor) => {
      const courseMatch = instructor.assignedCourses.some((course) =>
        course.title.toLowerCase().includes(normalizedSearch),
      );

      return (
        instructor.name.toLowerCase().includes(normalizedSearch) ||
        instructor.email.toLowerCase().includes(normalizedSearch) ||
        courseMatch
      );
    });
  }, [overview, searchQuery]);

  async function handlePromoteStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !selectedStudentId) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await updateUserInstructorRole(
        token,
        Number(selectedStudentId),
        "INSTRUCTOR",
      );

      setSelectedStudentId("");
      setSuccessMessage("Student promoted to instructor successfully.");
      await loadInstructors();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to promote student.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDemoteInstructor(instructorId: number, name: string) {
    if (!token) {
      return;
    }

    const shouldDemote = window.confirm(
      `Demote ${name} to student? Their assigned courses will become unassigned.`,
    );

    if (!shouldDemote) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await updateUserInstructorRole(token, instructorId, "STUDENT");

      setSuccessMessage("Instructor demoted to student successfully.");
      await loadInstructors();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to demote instructor.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAssignCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !selectedCourseId) {
      return;
    }

    const instructorId = selectedInstructorId
      ? Number(selectedInstructorId)
      : null;

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await assignCourseInstructor(token, Number(selectedCourseId), instructorId);

      setSuccessMessage(
        instructorId
          ? "Course assigned to instructor successfully."
          : "Instructor removed from course successfully.",
      );

      setSelectedCourseId("");
      setSelectedInstructorId("");
      await loadInstructors();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update course instructor.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const stats = overview?.stats;

  return (
    <section className="admin-page">
      <div className="admin-hero-card">
        <div>
          <p className="small-heading">ADMIN INSTRUCTOR MANAGEMENT</p>
          <h1>Instructors</h1>
          <p>
            Promote students to instructors, assign courses, remove course
            assignments and track instructor performance.
          </p>
        </div>
      </div>

      {isLoading && <p className="status-text">Loading instructors...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}
      {successMessage && <p className="success-text">{successMessage}</p>}

      {!isLoading && !errorMessage && overview && stats && (
        <>
          <div className="admin-stats-grid">
            <div className="dashboard-card">
              <p>Instructors</p>
              <h2>{stats.instructorsCount}</h2>
              <span>Active instructor users</span>
            </div>

            <div className="dashboard-card">
              <p>Students Available</p>
              <h2>{stats.studentsAvailableToPromote}</h2>
              <span>Can be promoted</span>
            </div>

            <div className="dashboard-card">
              <p>Total Courses</p>
              <h2>{stats.totalCourses}</h2>
              <span>Platform courses</span>
            </div>

            <div className="dashboard-card">
              <p>Assigned Courses</p>
              <h2>{stats.assignedCourses}</h2>
              <span>With instructors</span>
            </div>

            <div className="dashboard-card">
              <p>Unassigned Courses</p>
              <h2>{stats.unassignedCourses}</h2>
              <span>Need instructor</span>
            </div>
          </div>

          <div className="admin-instructor-control-grid">
            <form
              className="admin-instructor-control-card"
              onSubmit={handlePromoteStudent}
            >
              <div>
                <p className="small-heading">PROMOTE USER</p>
                <h2>Promote Student to Instructor</h2>
              </div>

              <label>
                Select Student
                <select
                  value={selectedStudentId}
                  onChange={(event) => setSelectedStudentId(event.target.value)}
                  required
                >
                  <option value="">Choose student</option>
                  {overview.students.map((student) => (
                    <option value={student.id} key={student.id}>
                      {student.name} — {student.email}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="primary-button"
                disabled={isSaving || overview.students.length === 0}
              >
                Promote to Instructor
              </button>

              {overview.students.length === 0 && (
                <p className="status-text left-status-text">
                  No student users available to promote.
                </p>
              )}
            </form>

            <form
              className="admin-instructor-control-card"
              onSubmit={handleAssignCourse}
            >
              <div>
                <p className="small-heading">COURSE ASSIGNMENT</p>
                <h2>Assign Course to Instructor</h2>
              </div>

              <label>
                Select Course
                <select
                  value={selectedCourseId}
                  onChange={(event) => setSelectedCourseId(event.target.value)}
                  required
                >
                  <option value="">Choose course</option>
                  {overview.courses.map((course) => (
                    <option value={course.id} key={course.id}>
                      {course.title} —{" "}
                      {course.instructorUser
                        ? course.instructorUser.name
                        : "Unassigned"}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Select Instructor
                <select
                  value={selectedInstructorId}
                  onChange={(event) =>
                    setSelectedInstructorId(event.target.value)
                  }
                >
                  <option value="">Remove instructor / Unassigned</option>
                  {overview.instructors.map((instructor) => (
                    <option value={instructor.id} key={instructor.id}>
                      {instructor.name} — {instructor.email}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="primary-button"
                disabled={isSaving || overview.courses.length === 0}
              >
                Save Assignment
              </button>
            </form>
          </div>

          <div className="student-management-toolbar">
            <label>
              Search Instructors
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search instructor, email or course..."
              />
            </label>

            <p>
              Showing <strong>{filteredInstructors.length}</strong> of{" "}
              <strong>{overview.instructors.length}</strong> instructors
            </p>
          </div>

          {overview.instructors.length === 0 ? (
            <div className="empty-dashboard-card">
              <h2>No instructors yet</h2>
              <p>Promote a student to instructor using the form above.</p>
            </div>
          ) : filteredInstructors.length === 0 ? (
            <div className="empty-dashboard-card">
              <h2>No instructors found</h2>
              <p>Try another name, email or course title.</p>
            </div>
          ) : (
            <div className="admin-instructor-list">
              {filteredInstructors.map((instructor) => (
                <article className="admin-instructor-card" key={instructor.id}>
                  <div className="admin-student-header">
                    <div className="admin-student-identity">
                      <div className="profile-avatar-large small-student-avatar">
                        {instructor.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h2>{instructor.name}</h2>
                        <p>{instructor.email}</p>
                        <small>Joined: {formatDate(instructor.joinedAt)}</small>
                      </div>
                    </div>

                    <div className="admin-instructor-header-actions">
                      <div className="admin-student-badge">INSTRUCTOR</div>

                      <button
                        type="button"
                        className="danger-outline-button"
                        disabled={isSaving}
                        onClick={() =>
                          handleDemoteInstructor(
                            instructor.id,
                            instructor.name,
                          )
                        }
                      >
                        Demote
                      </button>
                    </div>
                  </div>

                  <div className="student-mini-stats">
                    <div>
                      <p>Courses</p>
                      <strong>{instructor.assignedCoursesCount}</strong>
                    </div>

                    <div>
                      <p>Students</p>
                      <strong>{instructor.uniqueStudentsCount}</strong>
                    </div>

                    <div>
                      <p>Lessons</p>
                      <strong>{instructor.lessonsCount}</strong>
                    </div>

                    <div>
                      <p>Quizzes</p>
                      <strong>{instructor.quizzesCount}</strong>
                    </div>

                    <div>
                      <p>Attempts</p>
                      <strong>{instructor.quizAttemptsCount}</strong>
                    </div>

                    <div>
                      <p>Certificates</p>
                      <strong>{instructor.certificatesCount}</strong>
                    </div>
                  </div>

                  <details className="student-details-panel">
                    <summary>View assigned courses</summary>

                    {instructor.assignedCourses.length === 0 ? (
                      <p className="status-text left-status-text">
                        No courses assigned yet.
                      </p>
                    ) : (
                      <div className="admin-instructor-course-grid">
                        {instructor.assignedCourses.map((course) => (
                          <article
                            className="admin-instructor-course-card"
                            key={course.id}
                          >
                            <div className="course-icon">
                              {course.shortName}
                            </div>

                            <div>
                              <p className="course-category-pill">
                                {course.category}
                              </p>
                              <h3>{course.title}</h3>
                              <p>{course.description}</p>
                            </div>

                            <div className="instructor-course-meta">
                              <span>{course.level}</span>
                              <span>{course.lessonsCount} lessons</span>
                              <span>{course.studentsCount} students</span>
                              <span>{course.quizzesCount} quizzes</span>
                              <span>
                                {course.certificatesCount} certificates
                              </span>
                            </div>

                            <Link
                              to={`/courses/${course.id}`}
                              className="secondary-button instructor-course-button"
                            >
                              Open Course
                            </Link>
                          </article>
                        ))}
                      </div>
                    )}
                  </details>
                </article>
              ))}
            </div>
          )}

          <div className="admin-instructor-table-card">
            <div className="section-heading-row">
              <div>
                <p className="small-heading">COURSE ASSIGNMENTS</p>
                <h2>All Courses</h2>
              </div>
            </div>

            <div className="responsive-table-wrapper">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Category</th>
                    <th>Instructor</th>
                    <th>Lessons</th>
                    <th>Students</th>
                    <th>Quizzes</th>
                    <th>Certificates</th>
                  </tr>
                </thead>

                <tbody>
                  {overview.courses.map((course) => (
                    <tr key={course.id}>
                      <td>
                        <div className="analytics-course-cell">
                          <div className="course-icon">{course.shortName}</div>

                          <div>
                            <strong>{course.title}</strong>
                            <p>{course.level}</p>
                          </div>
                        </div>
                      </td>

                      <td>{course.category}</td>
                      <td>
                        {course.instructorUser
                          ? course.instructorUser.name
                          : "Unassigned"}
                      </td>
                      <td>{course.lessonsCount}</td>
                      <td>{course.studentsCount}</td>
                      <td>{course.quizzesCount}</td>
                      <td>{course.certificatesCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default AdminInstructorsPage;