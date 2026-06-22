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

        setCourses(Array.isArray(courseData) ? courseData : []);
      } catch {
        setErrorMessage("Unable to load courses. Please check backend server.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, []);

  return (
    <section className="courses-page">
      <div className="dashboard-heading">
        <p className="small-heading">COURSE LIBRARY</p>
        <h1>All Courses</h1>
        <p>Browse all available courses and start learning.</p>
      </div>

      {isLoading && <p className="status-text">Loading courses...</p>}

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && !errorMessage && courses.length === 0 && (
        <p className="status-text">No courses available yet.</p>
      )}

      {!isLoading && !errorMessage && courses.length > 0 && (
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard course={course} key={course.id} />
          ))}
        </div>
      )}
    </section>
  );
}

export default CoursesPage;