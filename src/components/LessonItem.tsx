import type { Lesson } from "../types/course";

type LessonItemProps = {
  lesson: Lesson;
  lessonNumber: number;
  isCompleted: boolean;
  isDisabled?: boolean;
  disabledLabel?: string;
  onToggleComplete: (lessonId: number) => void;
};

function LessonItem({
  lesson,
  lessonNumber,
  isCompleted,
  isDisabled = false,
  disabledLabel = "Login Required",
  onToggleComplete,
}: LessonItemProps) {
  return (
    <article className={`lesson-item ${isCompleted ? "completed-lesson" : ""}`}>
      <div className="lesson-number">{isCompleted ? "✓" : lessonNumber}</div>

      <div className="lesson-information">
        <div className="lesson-title-row">
          <h3>{lesson.title}</h3>
          <span>{lesson.duration}</span>
        </div>

        <p>{lesson.description}</p>
      </div>

      <button
        type="button"
        className={isCompleted ? "lesson-button completed-button" : "lesson-button"}
        onClick={() => onToggleComplete(lesson.id)}
        disabled={isDisabled}
      >
        {isDisabled
          ? disabledLabel
          : isCompleted
            ? "Completed"
            : "Mark Complete"}
      </button>
    </article>
  );
}

export default LessonItem;