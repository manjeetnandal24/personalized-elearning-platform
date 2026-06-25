import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchAdminCourses } from "../api/adminApi";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types/course";

function AdminLibraryPage() {
  const { token } = useAuth();

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
          error instanceof Error ? error.message : "Unable to load library.",
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

  const totalTopics = courses.reduce(
    (total, course) => total + course.topics.length,
    0,
  );

  return (
    <section className="admin-page">
      <div className="admin-hero-card">
        <div>
          <p className="small-heading">CONTENT LIBRARY</p>
          <h1>Course Library</h1>
          <p>Review all courses, topics and lessons in one place.</p>
        </div>
      </div>

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

      {isLoading && <p className="status-text">Loading library...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && !errorMessage && (
        <div className="admin-course-management-list">
          {courses.map((course) => (
            <article className="admin-course-management-card" key={course.id}>
              <div className="admin-course-card-top">
                <div className="course-icon">{course.shortName}</div>

                <div>
                  <h3>{course.title}</h3>
                  <p>
                    {course.level} • {course.topics.length} topics •{" "}
                    {course.lessons.length} lessons
                  </p>
                </div>
              </div>

              <p className="admin-course-description">{course.description}</p>

              <div className="admin-action-row">
                <Link to={`/courses/${course.id}`} className="secondary-button">
                  View Course
                </Link>
              </div>

              {course.topics.length > 0 && (
                <div className="admin-lesson-list">
                  <h4>Topics / Modules</h4>

                  {course.topics.map((topic) => (
                    <div className="admin-lesson-row" key={topic.id}>
                      <div>
                        <strong>
                          Module {topic.position}: {topic.title}
                        </strong>
                        <p>{topic.description}</p>
                        <small>{topic.lessons.length} lessons</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminLibraryPage;