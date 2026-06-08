import type { Course } from "../data/courses";

type CourseCardProps = {
  course: Course;
};

function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="course-card">
      <div className="course-icon">{course.shortName}</div>

      <h3>{course.title}</h3>

      <p>{course.description}</p>

      <span>{course.level}</span>

      <button>View Course</button>
    </div>
  );
}

export default CourseCard;
