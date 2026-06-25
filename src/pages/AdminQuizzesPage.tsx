import { useEffect, useState } from "react";

import { fetchAdminCourses } from "../api/adminApi";
import AdminQuizBuilder from "../components/AdminQuizBuilder";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types/course";

function AdminQuizzesPage() {
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
          error instanceof Error ? error.message : "Unable to load courses.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, [token]);

  return (
    <section className="admin-page">
      <div className="admin-hero-card">
        <div>
          <p className="small-heading">ASSESSMENTS</p>
          <h1>Quiz Builder</h1>
          <p>Create quizzes and MCQ questions for students.</p>
        </div>
      </div>

      {isLoading && <p className="status-text">Loading courses...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && !errorMessage && <AdminQuizBuilder courses={courses} />}
    </section>
  );
}

export default AdminQuizzesPage;