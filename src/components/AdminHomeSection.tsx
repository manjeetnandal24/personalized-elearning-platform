import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchAdminCourses } from "../api/adminApi";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types/course";

function AdminHomeSection() {
  const { token } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadAdminData() {
      if (!token) {
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await fetchAdminCourses(token);
        setCourses(data);
      } catch {
        setErrorMessage("Unable to load admin overview.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAdminData();
  }, [token]);

  const totalCourses = courses.length;

  const totalLessons = courses.reduce(
    (total, course) => total + course.lessons.length,
    0,
  );

  return (
    <section className="admin-home-section">
      <div className="section-heading">
        <h2>Admin Overview</h2>
        <p>Manage platform courses and lessons from one place.</p>
      </div>

      {isLoading && <p className="status-text">Loading admin overview...</p>}

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && !errorMessage && (
        <>
          <div className="admin-overview-grid">
            <div className="dashboard-card">
              <p>Total Courses</p>
              <h2>{totalCourses}</h2>
            </div>

            <div className="dashboard-card">
              <p>Total Lessons</p>
              <h2>{totalLessons}</h2>
            </div>

            <div className="dashboard-card">
              <p>Admin Access</p>
              <h2>Active</h2>
            </div>
          </div>

          <div className="admin-home-card">
            <div>
              <p className="small-heading">COURSE MANAGEMENT</p>
              <h2>Create and manage learning content</h2>
              <p>
                Add new courses, attach lessons, and keep the learning platform
                updated for students.
              </p>
            </div>

            <Link to="/admin" className="course-link dashboard-login-link">
              Open Admin Panel
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

export default AdminHomeSection;
