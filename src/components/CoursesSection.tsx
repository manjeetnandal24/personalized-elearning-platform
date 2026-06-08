import { courses } from "../data/courses";
import CourseCard from "./CourseCard";

function CoursesSection() {
  return (
    <section className="courses-section" id="courses">
      <div className="section-heading">
        <h2>Popular Courses</h2>
        <p>Start learning with our beginner-friendly courses.</p>
      </div>

      <div className="course-container">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}

export default CoursesSection;
