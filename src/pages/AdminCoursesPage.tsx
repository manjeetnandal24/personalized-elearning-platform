import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import {
  createAdminCourse,
  deleteAdminCourse,
  fetchAdminCourses,
  updateAdminCourse,
  type CourseFormPayload,
} from "../api/adminApi";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types/course";

const emptyCourseForm: CourseFormPayload = {
  title: "",
  description: "",
  shortName: "",
  level: "",
  category: "General",
  instructor: "",
};

function AdminCoursesPage() {
  const { token } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [courseForm, setCourseForm] =
    useState<CourseFormPayload>(emptyCourseForm);

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCourses() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchAdminCourses(token);
        setCourses(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load courses.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, [token]);

  function resetCourseForm() {
    setCourseForm(emptyCourseForm);
    setEditingCourseId(null);
  }

  function startEditingCourse(course: Course) {
    setEditingCourseId(course.id);

    setCourseForm({
      title: course.title,
      description: course.description,
      shortName: course.shortName,
      level: course.level,
      category: course.category || "General",
      instructor: course.instructor,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSaveCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) return;

    try {
      setMessage("");
      setErrorMessage("");

      if (editingCourseId) {
        const updatedCourse = await updateAdminCourse(
          editingCourseId,
          courseForm,
          token,
        );

        setCourses((currentCourses) =>
          currentCourses.map((course) =>
            course.id === updatedCourse.id ? updatedCourse : course,
          ),
        );

        setMessage("Course updated successfully.");
      } else {
        const newCourse = await createAdminCourse(courseForm, token);

        setCourses((currentCourses) => [newCourse, ...currentCourses]);
        setMessage("Course created successfully.");
      }

      resetCourseForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save course.",
      );
    }
  }

  async function handleDeleteCourse(course: Course) {
    if (!token) return;

    const confirmed = window.confirm(
      `Delete "${course.title}" and all its lessons, quizzes, certificates and progress? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setMessage("");
      setErrorMessage("");

      await deleteAdminCourse(course.id, token);

      setCourses((currentCourses) =>
        currentCourses.filter((currentCourse) => currentCourse.id !== course.id),
      );

      if (editingCourseId === course.id) {
        resetCourseForm();
      }

      setMessage("Course deleted successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete course.",
      );
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-hero-card">
        <div>
          <p className="small-heading">COURSE MANAGEMENT</p>
          <h1>Courses</h1>
          <p>Create, edit and delete courses with level and category details.</p>
        </div>
      </div>

      {message && <p className="status-text">{message}</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}
      {isLoading && <p className="status-text">Loading courses...</p>}

      <div className="admin-grid single-admin-grid">
        <form className="auth-form admin-form" onSubmit={handleSaveCourse}>
          <div className="form-heading">
            <p className="small-heading">
              {editingCourseId ? "EDIT" : "CREATE"}
            </p>
            <h2>{editingCourseId ? "Edit Course" : "Add New Course"}</h2>
          </div>

          <label>
            Course Title
            <input
              type="text"
              value={courseForm.title}
              onChange={(event) =>
                setCourseForm({ ...courseForm, title: event.target.value })
              }
              placeholder="Example: Python Basics"
            />
          </label>

          <label>
            Description
            <textarea
              value={courseForm.description}
              onChange={(event) =>
                setCourseForm({
                  ...courseForm,
                  description: event.target.value,
                })
              }
              placeholder="Write course description"
            />
          </label>

          <label>
            Short Name
            <input
              type="text"
              value={courseForm.shortName}
              onChange={(event) =>
                setCourseForm({ ...courseForm, shortName: event.target.value })
              }
              placeholder="PY"
            />
          </label>

          <label>
            Level
            <input
              type="text"
              value={courseForm.level}
              onChange={(event) =>
                setCourseForm({ ...courseForm, level: event.target.value })
              }
              placeholder="Beginner"
            />
          </label>

          <label>
            Category
            <input
              type="text"
              value={courseForm.category}
              onChange={(event) =>
                setCourseForm({
                  ...courseForm,
                  category: event.target.value,
                })
              }
              placeholder="Example: Web Development"
            />
          </label>

          <label>
            Instructor
            <input
              type="text"
              value={courseForm.instructor}
              onChange={(event) =>
                setCourseForm({
                  ...courseForm,
                  instructor: event.target.value,
                })
              }
              placeholder="Instructor name"
            />
          </label>

          <button type="submit" className="primary-button">
            {editingCourseId ? "Update Course" : "Create Course"}
          </button>

          {editingCourseId && (
            <button
              type="button"
              className="secondary-button full-width-button"
              onClick={resetCourseForm}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <div className="admin-course-panel">
        <div className="lessons-heading">
          <h2>Existing Courses</h2>
          <p>Edit or delete existing courses.</p>
        </div>

        {courses.length === 0 && !isLoading ? (
          <div className="empty-dashboard-card">
            <h2>No courses available</h2>
            <p>Create your first course using the form above.</p>
          </div>
        ) : (
          <div className="admin-course-management-list">
            {courses.map((course) => (
              <article className="admin-course-management-card" key={course.id}>
                <div className="admin-course-card-top">
                  <div className="course-icon">{course.shortName}</div>

                  <div>
                    <h3>{course.title}</h3>
                    <p>
                      {course.level} • {course.category || "General"} •{" "}
                      {course.lessons.length} lessons • {course.topics.length}{" "}
                      topics • Instructor: {course.instructor}
                    </p>
                  </div>
                </div>

                <p className="admin-course-description">{course.description}</p>

                <div className="admin-action-row">
                  <Link to={`/courses/${course.id}`} className="secondary-button">
                    View
                  </Link>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => startEditingCourse(course)}
                  >
                    Edit Course
                  </button>

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDeleteCourse(course)}
                  >
                    Delete Course
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminCoursesPage;