import { Link } from "react-router-dom";
import type { Course } from "../data/courses";

type CourseCardProps = {
  course: Course;
};

function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="course-card">
      <div className="course-icon">{course.shortName}</div>

      <h3>{course.title}</h3>

      <p>{course.description}</p>

      <div className="course-meta">
        <span>{course.level}</span>
        <small>{course.lessons.length} lessons</small>
      </div>

      <Link to={`/courses/${course.id}`} className="course-link">
        View Course
      </Link>
    </article>
  );
}

export default CourseCard;