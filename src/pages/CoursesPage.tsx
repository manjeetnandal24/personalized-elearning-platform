import { courses } from "../data/courses";
import CourseCard from "../components/CourseCard";

function CoursesPage() {
  return (
    <section className="page-section">
      <div className="section-heading">
        <h1>All Courses</h1>
        <p>Choose a course and begin your learning journey.</p>
      </div>

      <div className="course-container">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}

export default CoursesPage;
