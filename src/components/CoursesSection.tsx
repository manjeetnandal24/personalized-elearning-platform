import { useEffect, useState } from "react";

import { fetchCourses } from "../api/courseApi";
import type { Course } from "../types/course";
import CourseCard from "./CourseCard";

function CoursesSection() {
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
    <section className="courses-section" id="courses">
      <div className="section-heading">
        <h2>Popular Courses</h2>
        <p>Start learning with our beginner-friendly courses.</p>
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

export default CoursesSection;