import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchCourseById } from "../api/courseApi";
import {
  fetchCourseProgress,
  toggleLessonProgress,
} from "../api/progressApi";
import LessonItem from "../components/LessonItem";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types/course";

function CourseDetailsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { isAuthenticated, token } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProgressLoading, setIsProgressLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [progressMessage, setProgressMessage] = useState("");

  useEffect(() => {
    async function loadCourseDetails() {
      if (!courseId) {
        setErrorMessage("Invalid course ID.");
        setIsLoading(false);
        return;
      }

      try {
        const courseData = await fetchCourseById(courseId);
        setCourse(courseData);
      } catch {
        setErrorMessage("Course not found or backend is not connected.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCourseDetails();
  }, [courseId]);

  useEffect(() => {
    async function loadSavedProgress() {
      if (!course || !isAuthenticated || !token) {
        setCompletedLessonIds([]);
        return;
      }

      try {
        setIsProgressLoading(true);

        const progress = await fetchCourseProgress(course.id, token);

        setCompletedLessonIds(progress.completedLessonIds);
      } catch {
        setProgressMessage("Unable to load saved progress.");
      } finally {
        setIsProgressLoading(false);
      }
    }

    loadSavedProgress();
  }, [course, isAuthenticated, token]);

  async function toggleLessonCompletion(lessonId: number) {
    if (!isAuthenticated || !token) {
      return;
    }

    try {
      setProgressMessage("");

      const progress = await toggleLessonProgress(lessonId, token);

      setCompletedLessonIds(progress.completedLessonIds);
      setProgressMessage("Progress saved.");
    } catch {
      setProgressMessage("Unable to save progress. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <section className="course-details-page">
        <p className="status-text">Loading course details...</p>
      </section>
    );
  }

  if (errorMessage || !course) {
    return (
      <section className="course-not-found">
        <h1>Course not found</h1>
        <p>{errorMessage || "The requested course does not exist."}</p>

        <Link to="/courses" className="primary-link">
          View All Courses
        </Link>
      </section>
    );
  }

  const totalLessons = course.lessons.length;
  const completedLessons = completedLessonIds.length;

  const progressPercentage =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);

  return (
    <section className="course-details-page">
      <div className="course-details-header">
        <Link to="/courses" className="back-link">
          ← Back to Courses
        </Link>

        <div className="course-heading-layout">
          <div>
            <div className="course-badges">
              <span>{course.level}</span>
              <span>{course.lessons.length} lessons</span>
            </div>

            <h1>{course.title}</h1>

            <p>{course.description}</p>

            <small>Instructor: {course.instructor}</small>
          </div>

          <div className="large-course-icon">{course.shortName}</div>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="login-required-card">
          <div>
            <p className="small-heading">LOGIN REQUIRED</p>
            <h2>Login to track your lesson progress.</h2>
            <p>
              You can view the course content, but progress tracking is available
              only after login.
            </p>
          </div>

          <Link to="/login" className="course-link login-required-link">
            Login
          </Link>
        </div>
      )}

      <div className="course-progress-card">
        <div className="progress-heading-row">
          <div>
            <h2>Course Progress</h2>
            <p>
              {completedLessons} of {totalLessons} lessons completed
            </p>
          </div>

          <strong>{progressPercentage}%</strong>
        </div>

        <div className="details-progress-bar">
          <div
            className="details-progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {isProgressLoading && (
          <p className="status-text left-status-text">Loading saved progress...</p>
        )}

        {progressMessage && (
          <p className="status-text left-status-text">{progressMessage}</p>
        )}

        {progressPercentage === 100 && (
          <p className="completion-message">
            Excellent! You have completed this course.
          </p>
        )}
      </div>

      <div className="lessons-section">
        <div className="lessons-heading">
          <h2>Course Lessons</h2>
          <p>Complete lessons to increase your course progress.</p>
        </div>

        <div className="lesson-list">
          {course.lessons.map((lesson, index) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              lessonNumber={index + 1}
              isCompleted={completedLessonIds.includes(lesson.id)}
              isDisabled={!isAuthenticated}
              onToggleComplete={toggleLessonCompletion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CourseDetailsPage;