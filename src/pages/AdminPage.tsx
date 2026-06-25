import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchAdminCourses } from "../api/adminApi";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types/course";

function AdminPage() {
  const { user, token } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
          error instanceof Error
            ? error.message
            : "Unable to load admin overview.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, [token]);

  const totalTopics = courses.reduce(
    (total, course) => total + course.topics.length,
    0,
  );

  const totalLessons = courses.reduce(
    (total, course) => total + course.lessons.length,
    0,
  );

  return (
    <section className="admin-page">
      <div className="admin-hero-card">
        <div>
          <p className="small-heading">ADMIN OVERVIEW</p>
          <h1>Welcome Admin, {user?.name}</h1>
          <p>Manage courses, curriculum, quizzes and learning content.</p>
        </div>

        <div className="admin-role-badge">
          <span>{user?.role}</span>
          <strong>{user?.name}</strong>
        </div>
      </div>

      {isLoading && <p className="status-text">Loading admin overview...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && !errorMessage && (
        <>
          <div className="admin-stats-grid">
            <div className="dashboard-card">
              <p>Total Courses</p>
              <h2>{courses.length}</h2>
            </div>

            <div className="dashboard-card">
              <p>Total Topics</p>
              <h2>{totalTopics}</h2>
            </div>

            <div className="dashboard-card">
              <p>Total Lessons</p>
              <h2>{totalLessons}</h2>
            </div>
          </div>

          <div className="admin-overview-actions">
            <Link to="/admin/courses" className="admin-overview-card">
              <span>📘</span>
              <h3>Manage Courses</h3>
              <p>Create, edit and delete courses.</p>
            </Link>

            <Link to="/admin/curriculum" className="admin-overview-card">
              <span>🧩</span>
              <h3>Build Curriculum</h3>
              <p>Add topics, lessons and lesson content.</p>
            </Link>

            <Link to="/admin/quizzes" className="admin-overview-card">
              <span>🧠</span>
              <h3>Quiz Builder</h3>
              <p>Create assessments and questions.</p>
            </Link>

            <Link to="/admin/library" className="admin-overview-card">
              <span>🗂️</span>
              <h3>Course Library</h3>
              <p>Review all content in one place.</p>
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

export default AdminPage;