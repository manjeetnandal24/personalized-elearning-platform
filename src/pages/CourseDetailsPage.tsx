import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchCourseById } from "../api/courseApi";
import {
  enrollInCourse,
  fetchEnrollmentStatus,
} from "../api/enrollmentApi";
import {
  fetchCourseProgress,
  toggleLessonProgress,
} from "../api/progressApi";
import LessonItem from "../components/LessonItem";
import StudentQuizSection from "../components/StudentQuizSection";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types/course";

function CourseDetailsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { isAuthenticated, token, user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrollmentLoading, setIsEnrollmentLoading] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isProgressLoading, setIsProgressLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [progressMessage, setProgressMessage] = useState("");
  const [enrollmentMessage, setEnrollmentMessage] = useState("");

  const isAdmin = user?.role === "ADMIN";
  const isStudent = isAuthenticated && !isAdmin;
  const canTrackProgress = isStudent && isEnrolled;

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
    async function loadEnrollmentStatus() {
      if (!course || !isStudent || !token) {
        setIsEnrolled(false);
        return;
      }

      try {
        setIsEnrollmentLoading(true);
        setEnrollmentMessage("");

        const status = await fetchEnrollmentStatus(course.id, token);
        setIsEnrolled(status.isEnrolled);
      } catch {
        setEnrollmentMessage("Unable to check enrollment status.");
      } finally {
        setIsEnrollmentLoading(false);
      }
    }

    loadEnrollmentStatus();
  }, [course, isStudent, token]);

  useEffect(() => {
    async function loadSavedProgress() {
      if (!course || !canTrackProgress || !token) {
        setCompletedLessonIds([]);
        return;
      }

      try {
        setIsProgressLoading(true);
        setProgressMessage("");

        const progress = await fetchCourseProgress(course.id, token);
        setCompletedLessonIds(progress.completedLessonIds);
      } catch {
        setProgressMessage("Unable to load saved progress.");
      } finally {
        setIsProgressLoading(false);
      }
    }

    loadSavedProgress();
  }, [course, canTrackProgress, token]);

  async function handleEnrollCourse() {
    if (!course || !token) {
      return;
    }

    try {
      setIsEnrolling(true);
      setEnrollmentMessage("");
      setProgressMessage("");

      await enrollInCourse(course.id, token);

      setIsEnrolled(true);
      setEnrollmentMessage("You are enrolled in this course.");
    } catch (error) {
      setEnrollmentMessage(
        error instanceof Error
          ? error.message
          : "Unable to enroll in this course.",
      );
    } finally {
      setIsEnrolling(false);
    }
  }

  async function toggleLessonCompletion(lessonId: number) {
    if (!canTrackProgress || !token) {
      setProgressMessage("Please enroll in this course first.");
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

  const topics = course.topics || [];
  const allLessons = course.lessons || [];

  const lessonsInsideTopics = new Set(
    topics.flatMap((topic) => topic.lessons.map((lesson) => lesson.id)),
  );

  const ungroupedLessons = allLessons.filter(
    (lesson) => !lessonsInsideTopics.has(lesson.id),
  );

  const totalLessons = allLessons.length;
  const completedLessons = completedLessonIds.length;

  const progressPercentage =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);

  const disabledLabel = isAdmin
    ? "Admin View"
    : !isAuthenticated
      ? "Login Required"
      : !isEnrolled
        ? "Enroll First"
        : "Unavailable";

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
              <span>{totalLessons} lessons</span>

              {isStudent && isEnrolled && <span>Enrolled</span>}
            </div>

            <h1>{course.title}</h1>

            <p>{course.description}</p>

            <small>Instructor: {course.instructor}</small>
          </div>

          <div className="large-course-icon">{course.shortName}</div>
        </div>
      </div>

      {isAdmin && (
        <div className="login-required-card">
          <div>
            <p className="small-heading">ADMIN VIEW</p>
            <h2>Progress tracking is hidden for admin accounts.</h2>
            <p>
              You can review the course content here. To add courses, topics or
              lessons, use the Admin Panel.
            </p>
          </div>

          <Link to="/admin" className="course-link login-required-link">
            Admin Panel
          </Link>
        </div>
      )}

      {!isAuthenticated && (
        <div className="login-required-card">
          <div>
            <p className="small-heading">LOGIN REQUIRED</p>
            <h2>Login to enroll and track progress.</h2>
            <p>
              You can view the course content, but enrollment, progress tracking
              and quiz attempts are available only after login.
            </p>
          </div>

          <Link to="/login" className="course-link login-required-link">
            Login
          </Link>
        </div>
      )}

      {isStudent && !isEnrolled && (
        <div className="login-required-card">
          <div>
            <p className="small-heading">ENROLLMENT REQUIRED</p>
            <h2>Enroll in this course to start learning.</h2>
            <p>
              After enrollment, you can mark lessons complete, track progress and
              attempt quizzes.
            </p>

            {isEnrollmentLoading && (
              <p className="status-text left-status-text">
                Checking enrollment status...
              </p>
            )}

            {enrollmentMessage && (
              <p className="status-text left-status-text">
                {enrollmentMessage}
              </p>
            )}
          </div>

          <button
            type="button"
            className="course-link login-required-link"
            onClick={handleEnrollCourse}
            disabled={isEnrolling || isEnrollmentLoading}
          >
            {isEnrolling ? "Enrolling..." : "Enroll Course"}
          </button>
        </div>
      )}

      {isStudent && isEnrolled && (
        <div className="login-required-card">
          <div>
            <p className="small-heading">ENROLLED</p>
            <h2>You are enrolled in this course.</h2>
            <p>You can now track lessons and attempt quizzes.</p>

            {enrollmentMessage && (
              <p className="status-text left-status-text">
                {enrollmentMessage}
              </p>
            )}
          </div>

          <Link to="/dashboard/courses" className="course-link login-required-link">
            My Courses
          </Link>
        </div>
      )}

      {!isAdmin && (
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
            <p className="status-text left-status-text">
              Loading saved progress...
            </p>
          )}

          {progressMessage && (
            <p className="status-text left-status-text">{progressMessage}</p>
          )}

          {!isAuthenticated && (
            <p className="status-text left-status-text">
              Login first to save progress.
            </p>
          )}

          {isStudent && !isEnrolled && (
            <p className="status-text left-status-text">
              Enroll first to unlock progress tracking.
            </p>
          )}

          {progressPercentage === 100 && totalLessons > 0 && (
            <p className="completion-message">
              Excellent! You have completed this course.
            </p>
          )}
        </div>
      )}

      <div className="lessons-section">
        <div className="lessons-heading">
          <h2>Course Curriculum</h2>

          {isAdmin ? (
            <p>Admin view: review topics and lessons without progress controls.</p>
          ) : isStudent && !isEnrolled ? (
            <p>Read lessons freely, but enroll first to save progress.</p>
          ) : (
            <p>Study lessons and mark them complete after reading.</p>
          )}
        </div>

        <div className="lesson-list">
          {topics.length === 0 && ungroupedLessons.length === 0 && (
            <div className="empty-dashboard-card">
              <h2>No lessons added yet</h2>
              <p>This course does not have any lessons or topics yet.</p>
            </div>
          )}

          {topics.length > 0 && (
            <div className="topic-list">
              {topics.map((topic) => (
                <div className="topic-card" key={topic.id}>
                  <div className="topic-heading">
                    <div>
                      <p className="small-heading">MODULE {topic.position}</p>
                      <h3>{topic.title}</h3>
                      <p>{topic.description}</p>
                    </div>

                    <span>{topic.lessons.length} lessons</span>
                  </div>

                  {topic.lessons.length === 0 ? (
                    <p className="status-text left-status-text">
                      No lessons added in this topic yet.
                    </p>
                  ) : (
                    topic.lessons.map((lesson, index) => (
                      <LessonItem
                        key={lesson.id}
                        lesson={lesson}
                        lessonNumber={index + 1}
                        isCompleted={
                          !isAdmin && completedLessonIds.includes(lesson.id)
                        }
                        isDisabled={!canTrackProgress}
                        disabledLabel={disabledLabel}
                        onToggleComplete={toggleLessonCompletion}
                      />
                    ))
                  )}
                </div>
              ))}
            </div>
          )}

          {ungroupedLessons.length > 0 && (
            <div className="topic-card">
              <div className="topic-heading">
                <div>
                  <p className="small-heading">UNGROUPED</p>
                  <h3>Other Lessons</h3>
                  <p>Lessons not assigned to a topic yet.</p>
                </div>

                <span>{ungroupedLessons.length} lessons</span>
              </div>

              {ungroupedLessons.map((lesson, index) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  lessonNumber={index + 1}
                  isCompleted={!isAdmin && completedLessonIds.includes(lesson.id)}
                  isDisabled={!canTrackProgress}
                  disabledLabel={disabledLabel}
                  onToggleComplete={toggleLessonCompletion}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isStudent && !isEnrolled ? (
        <div className="login-required-card">
          <div>
            <p className="small-heading">QUIZ LOCKED</p>
            <h2>Enroll to attempt quizzes.</h2>
            <p>
              Quiz attempts and scores are available only after enrolling in this
              course.
            </p>
          </div>

          <button
            type="button"
            className="course-link login-required-link"
            onClick={handleEnrollCourse}
            disabled={isEnrolling || isEnrollmentLoading}
          >
            {isEnrolling ? "Enrolling..." : "Enroll Course"}
          </button>
        </div>
      ) : (
        <StudentQuizSection courseId={course.id} />
      )}
    </section>
  );
}

export default CourseDetailsPage;