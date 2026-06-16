import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import {
  addLessonToCourse,
  createAdminCourse,
  fetchAdminCourses,
} from "../api/adminApi";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types/course";

function AdminPage() {
  const { user, token } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    shortName: "",
    level: "",
    instructor: "",
  });

  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    duration: "",
  });

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

  async function handleCreateCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    try {
      setMessage("");
      setErrorMessage("");

      const newCourse = await createAdminCourse(courseForm, token);

      setCourses((currentCourses) => [newCourse, ...currentCourses]);
      setSelectedCourseId(String(newCourse.id));

      setCourseForm({
        title: "",
        description: "",
        shortName: "",
        level: "",
        instructor: "",
      });

      setMessage("Course created successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create course.",
      );
    }
  }

  async function handleAddLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !selectedCourseId) {
      setErrorMessage("Please select a course first.");
      return;
    }

    try {
      setMessage("");
      setErrorMessage("");

      await addLessonToCourse(Number(selectedCourseId), lessonForm, token);

      const updatedCourses = await fetchAdminCourses(token);
      setCourses(updatedCourses);

      setLessonForm({
        title: "",
        description: "",
        duration: "",
      });

      setMessage("Lesson added successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to add lesson.",
      );
    }
  }

  return (
    <section className="admin-page">
      <div className="dashboard-heading">
        <p className="small-heading">ADMIN PANEL</p>
        <h1>Course Management</h1>
        <p>Create courses and add lessons from the admin dashboard.</p>
      </div>

      <div className="auth-info-card">
        <div>
          <p className="small-heading">ADMIN ACCOUNT</p>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <p>Role: {user?.role}</p>
        </div>
      </div>

      {message && <p className="status-text">{message}</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}
      {isLoading && <p className="status-text">Loading admin courses...</p>}

      <div className="admin-grid">
        <form className="auth-form admin-form" onSubmit={handleCreateCourse}>
          <h2>Add New Course</h2>

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
            Create Course
          </button>
        </form>

        <form className="auth-form admin-form" onSubmit={handleAddLesson}>
          <h2>Add Lesson</h2>

          <label>
            Select Course
            <select
              value={selectedCourseId}
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
            Description
            <textarea
              value={lessonForm.description}
              onChange={(event) =>
                setLessonForm({
                  ...lessonForm,
                  description: event.target.value,
                })
              }
              placeholder="Write a short lesson description"
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
            Add Lesson
          </button>
        </form>
      </div>

      <div className="dashboard-course-list">
        <div className="lessons-heading">
          <h2>All Courses</h2>
          <p>Courses currently available in the database.</p>
        </div>

        {courses.map((course) => (
          <Link
            to={`/courses/${course.id}`}
            className="dashboard-course-row"
            key={course.id}
          >
            <div className="course-icon">{course.shortName}</div>

            <div className="dashboard-course-info">
              <h3>{course.title}</h3>
              <p>
                {course.level} • {course.lessons.length} lessons
              </p>
            </div>

            <strong>View</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default AdminPage;