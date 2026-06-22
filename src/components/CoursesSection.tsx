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
    <section className="courses-section" id="courses">
      <div className="section-heading">
        <h2>Explore Courses</h2>
        <p>Choose a course and start learning step by step.</p>
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

export default CoursesSection;