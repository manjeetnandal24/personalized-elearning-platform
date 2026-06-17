import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import {
  addLessonToCourse,
  createAdminCourse,
  deleteAdminCourse,
  deleteLessonFromCourse,
  fetchAdminCourses,
  updateAdminCourse,
  updateLessonInCourse,
  type CourseFormPayload,
  type LessonFormPayload,
} from "../api/adminApi";
import { useAuth } from "../context/AuthContext";
import type { Course, Lesson } from "../types/course";

const emptyCourseForm: CourseFormPayload = {
  title: "",
  description: "",
  shortName: "",
  level: "",
  instructor: "",
};

const emptyLessonForm: LessonFormPayload = {
  title: "",
  description: "",
  content: "",
  duration: "",
};

function AdminPage() {
  const { user, token } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [courseForm, setCourseForm] =
    useState<CourseFormPayload>(emptyCourseForm);

  const [lessonForm, setLessonForm] =
    useState<LessonFormPayload>(emptyLessonForm);

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
          error instanceof Error
            ? error.message
            : "Unable to load admin courses.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, [token]);

  const totalLessons = courses.reduce(
    (total, course) => total + course.lessons.length,
    0,
  );

  function resetCourseForm() {
    setCourseForm(emptyCourseForm);
    setEditingCourseId(null);
  }

  function resetLessonForm() {
    setLessonForm(emptyLessonForm);
    setEditingLessonId(null);
    setSelectedCourseId("");
  }

  function startEditingCourse(course: Course) {
    setEditingCourseId(course.id);

    setCourseForm({
      title: course.title,
      description: course.description,
      shortName: course.shortName,
      level: course.level,
      instructor: course.instructor,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function startEditingLesson(course: Course, lesson: Lesson) {
    setEditingLessonId(lesson.id);
    setSelectedCourseId(String(course.id));

    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      content: lesson.content || "",
      duration: lesson.duration,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function refreshCourses() {
    if (!token) {
      return;
    }

    const updatedCourses = await fetchAdminCourses(token);
    setCourses(updatedCourses);
  }

  async function handleSaveCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

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
        setSelectedCourseId(String(newCourse.id));

        setMessage("Course created successfully.");
      }

      resetCourseForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save course.",
      );
    }
  }

  async function handleSaveLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    if (!editingLessonId && !selectedCourseId) {
      setErrorMessage("Please select a course first.");
      return;
    }

    try {
      setMessage("");
      setErrorMessage("");

      if (editingLessonId) {
        await updateLessonInCourse(editingLessonId, lessonForm, token);
        setMessage("Lesson updated successfully.");
      } else {
        await addLessonToCourse(Number(selectedCourseId), lessonForm, token);
        setMessage("Lesson added successfully.");
      }

      await refreshCourses();
      resetLessonForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save lesson.",
      );
    }
  }

  async function handleDeleteCourse(course: Course) {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${course.title}" and all its lessons? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setErrorMessage("");

      await deleteAdminCourse(course.id, token);

      setCourses((currentCourses) =>
        currentCourses.filter((currentCourse) => currentCourse.id !== course.id),
      );

      if (selectedCourseId === String(course.id)) {
        resetLessonForm();
      }

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

  async function handleDeleteLesson(lessonId: number) {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this lesson? Student progress for this lesson will also be removed.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setErrorMessage("");

      await deleteLessonFromCourse(lessonId, token);
      await refreshCourses();

      if (editingLessonId === lessonId) {
        resetLessonForm();
      }

      setMessage("Lesson deleted successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete lesson.",
      );
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-hero-card">
        <div>
          <p className="small-heading">ADMIN PANEL</p>
          <h1>Course Management</h1>
          <p>Create, update and remove learning content shown to students.</p>
        </div>

        <div className="admin-role-badge">
          <span>{user?.role}</span>
          <strong>{user?.name}</strong>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="dashboard-card">
          <p>Total Courses</p>
          <h2>{courses.length}</h2>
        </div>

        <div className="dashboard-card">
          <p>Total Lessons</p>
          <h2>{totalLessons}</h2>
        </div>

        <div className="dashboard-card">
          <p>Admin Account</p>
          <h2>Active</h2>
        </div>
      </div>

      {message && <p className="status-text">{message}</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}
      {isLoading && <p className="status-text">Loading admin courses...</p>}

      <div className="admin-grid">
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
              placeholder="Write a short course description"
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
              placeholder="Manjeet"
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

        <form className="auth-form admin-form" onSubmit={handleSaveLesson}>
          <div className="form-heading">
            <p className="small-heading">
              {editingLessonId ? "EDIT LESSON" : "LESSONS"}
            </p>
            <h2>{editingLessonId ? "Edit Lesson Content" : "Add Lesson"}</h2>
          </div>

          <label>
            Select Course
            <select
              value={selectedCourseId}
              disabled={editingLessonId !== null}
              onChange={(event) => setSelectedCourseId(event.target.value)}
            >
              <option value="">Choose a course</option>

              {courses.map((course) => (
                <option value={course.id} key={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Lesson Title
            <input
              type="text"
              value={lessonForm.title}
              onChange={(event) =>
                setLessonForm({ ...lessonForm, title: event.target.value })
              }
              placeholder="Example: Introduction to Python"
            />
          </label>

          <label>
            Short Description
            <textarea
              value={lessonForm.description}
              onChange={(event) =>
                setLessonForm({
                  ...lessonForm,
                  description: event.target.value,
                })
              }
              placeholder="Write a short lesson summary"
            />
          </label>

          <label>
            Full Lesson Content
            <textarea
              className="lesson-content-textarea"
              value={lessonForm.content}
              onChange={(event) =>
                setLessonForm({
                  ...lessonForm,
                  content: event.target.value,
                })
              }
              placeholder="Write full lesson notes, examples, code, or explanation here..."
            />
          </label>

          <label>
            Duration
            <input
              type="text"
              value={lessonForm.duration}
              onChange={(event) =>
                setLessonForm({ ...lessonForm, duration: event.target.value })
              }
              placeholder="12 min"
            />
          </label>

          <button type="submit" className="primary-button">
            {editingLessonId ? "Update Lesson" : "Add Lesson"}
          </button>

          {editingLessonId && (
            <button
              type="button"
              className="secondary-button full-width-button"
              onClick={resetLessonForm}
            >
              Cancel Lesson Edit
            </button>
          )}
        </form>
      </div>

      <div className="admin-course-panel">
        <div className="lessons-heading">
          <h2>Course Library</h2>
          <p>Edit courses, delete courses, edit lesson content or remove lessons.</p>
        </div>

        {courses.length === 0 && !isLoading ? (
          <div className="empty-dashboard-card">
            <h2>No courses added yet</h2>
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
                      {course.level} • {course.lessons.length} lessons •
                      Instructor: {course.instructor}
                    </p>
                  </div>
                </div>

                <p className="admin-course-description">
                  {course.description}
                </p>

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

                {course.lessons.length > 0 && (
                  <div className="admin-lesson-list">
                    <h4>Lessons</h4>

                    {course.lessons.map((lesson) => (
                      <div className="admin-lesson-row" key={lesson.id}>
                        <div>
                          <strong>
                            {lesson.position}. {lesson.title}
                          </strong>
                          <p>{lesson.duration}</p>
                          <small>
                            {lesson.content
                              ? "Content added"
                              : "No content added"}
                          </small>
                        </div>

                        <div className="admin-lesson-actions">
                          <button
                            type="button"
                            className="secondary-button small-secondary-button"
                            onClick={() => startEditingLesson(course, lesson)}
                          >
                            Edit Lesson
                          </button>

                          <button
                            type="button"
                            className="danger-button small-danger-button"
                            onClick={() => handleDeleteLesson(lesson.id)}
                          >
                            Delete Lesson
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminPage;