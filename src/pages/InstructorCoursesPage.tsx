import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  fetchInstructorCourses,
  type InstructorCourseOverview,
} from "../api/instructorApi";
import { useAuth } from "../context/AuthContext";

function InstructorCoursesPage() {
  const { token } = useAuth();

  const [courses, setCourses] = useState<InstructorCourseOverview[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCourses() {
      if (!token) {
        setErrorMessage("Instructor token is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchInstructorCourses(token);
        setCourses(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load instructor courses.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, [token]);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (!normalizedSearch) {
      return courses;
    }

    return courses.filter((course) => {
      return (
        course.title.toLowerCase().includes(normalizedSearch) ||
        course.shortName.toLowerCase().includes(normalizedSearch) ||
        course.category.toLowerCase().includes(normalizedSearch) ||
        course.level.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [courses, searchQuery]);

  return (
    <section className="admin-page">
      <div className="admin-hero-card instructor-hero-card">
        <div>
          <p className="small-heading">INSTRUCTOR COURSES</p>
          <h1>My Courses</h1>
          <p>
            View all courses assigned to you by the admin. You can open course
            details, check lessons, students, quizzes and certificates.
          </p>
        </div>
      </div>

      {isLoading && <p className="status-text">Loading your courses...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && !errorMessage && (
        <>
          <div className="student-management-toolbar">
            <label>
              Search Courses
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by title, short name, category or level..."
              />
            </label>

            <p>
              Showing <strong>{filteredCourses.length}</strong> of{" "}
              <strong>{courses.length}</strong> courses
            </p>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="empty-dashboard-card">
              <h2>No assigned courses found</h2>
              <p>
                Ask the admin to assign courses to your instructor account.
              </p>
            </div>
          ) : (
            <div className="instructor-course-grid">
              {filteredCourses.map((course) => (
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
                    <span>{course.certificatesCount} certificates</span>
                  </div>

                  <div className="instructor-course-actions">
                    <Link
                      to={`/courses/${course.id}`}
                      className="primary-button instructor-course-button"
                    >
                      Open Course
                    </Link>

                    <Link
                      to="/instructor/curriculum"
                      className="secondary-button instructor-course-button"
                    >
                      Manage Curriculum
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default InstructorCoursesPage;