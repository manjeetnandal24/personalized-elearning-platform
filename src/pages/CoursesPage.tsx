import { useEffect, useState } from "react";

import { fetchCourses } from "../api/courseApi";
import CourseCard from "../components/CourseCard";
import type { Course } from "../types/course";

function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        const courseData = await fetchCourses();
        setCourses(courseData);
      } catch {
        setErrorMessage("Unable to load courses. Please check the backend.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, []);

  return (
    <section className="page-section">
      <div className="section-heading">
        <h1>All Courses</h1>
        <p>Choose a course and begin your learning journey.</p>
      </div>

      {isLoading && <p className="status-text">Loading courses...</p>}

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && !errorMessage && (
        <div className="course-container">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}

export default CoursesPage;