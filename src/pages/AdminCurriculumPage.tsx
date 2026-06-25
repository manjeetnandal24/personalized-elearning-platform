import { useEffect, useState, type FormEvent } from "react";

import {
  addLessonToCourse,
  createTopicForCourse,
  deleteLessonFromCourse,
  fetchAdminCourses,
  updateLessonInCourse,
  type LessonFormPayload,
  type TopicFormPayload,
} from "../api/adminApi";
import { useAuth } from "../context/AuthContext";
import type { Course, Lesson } from "../types/course";

const emptyTopicForm: TopicFormPayload = {
  title: "",
  description: "",
};

const emptyLessonForm: LessonFormPayload = {
  title: "",
  description: "",
  content: "",
  duration: "",
  topicId: null,
};

function AdminCurriculumPage() {
  const { token } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);

  const [selectedTopicCourseId, setSelectedTopicCourseId] = useState("");
  const [selectedLessonCourseId, setSelectedLessonCourseId] = useState("");

  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);

  const [topicForm, setTopicForm] = useState<TopicFormPayload>(emptyTopicForm);
  const [lessonForm, setLessonForm] =
    useState<LessonFormPayload>(emptyLessonForm);

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCourses() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchAdminCourses(token);
        setCourses(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load curriculum data.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, [token]);

  const selectedLessonCourse = courses.find(
    (course) => course.id === Number(selectedLessonCourseId),
  );

  async function refreshCourses() {
    if (!token) return;

    const data = await fetchAdminCourses(token);
    setCourses(data);
  }

  function resetLessonForm() {
    setLessonForm(emptyLessonForm);
    setEditingLessonId(null);
    setSelectedLessonCourseId("");
  }

  function startEditingLesson(course: Course, lesson: Lesson) {
    setEditingLessonId(lesson.id);
    setSelectedLessonCourseId(String(course.id));

    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      content: lesson.content || "",
      duration: lesson.duration,
      topicId: lesson.topicId || null,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleCreateTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !selectedTopicCourseId) {
      setErrorMessage("Please select a course for the topic.");
      return;
    }

    try {
      setMessage("");
      setErrorMessage("");

      await createTopicForCourse(Number(selectedTopicCourseId), topicForm, token);
      await refreshCourses();

      setTopicForm(emptyTopicForm);
      setMessage("Topic created successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create topic.",
      );
    }
  }

  async function handleSaveLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) return;

    if (!editingLessonId && !selectedLessonCourseId) {
      setErrorMessage("Please select a course first.");
      return;
    }

    try {
      setMessage("");
      setErrorMessage("");

      if (editingLessonId) {
        await updateLessonInCourse(editingLessonId, lessonForm, token);
        setMessage("Lesson updated successfully.");
      } else {
        await addLessonToCourse(Number(selectedLessonCourseId), lessonForm, token);
        setMessage("Lesson added successfully.");
      }

      await refreshCourses();
      resetLessonForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save lesson.",
      );
    }
  }

  async function handleDeleteLesson(lessonId: number) {
    if (!token) return;

    const confirmed = window.confirm(
      "Delete this lesson? Student progress for this lesson will also be removed.",
    );

    if (!confirmed) return;

    try {
      setMessage("");
      setErrorMessage("");

      await deleteLessonFromCourse(lessonId, token);
      await refreshCourses();

      if (editingLessonId === lessonId) {
        resetLessonForm();
      }

      setMessage("Lesson deleted successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete lesson.",
      );
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-hero-card">
        <div>
          <p className="small-heading">CURRICULUM BUILDER</p>
          <h1>Topics and Lessons</h1>
          <p>
            Build structured course curriculum using topics, modules, lessons and
            full lesson content.
          </p>
        </div>
      </div>

      {message && <p className="status-text">{message}</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}
      {isLoading && <p className="status-text">Loading curriculum...</p>}

      <div className="admin-grid">
        <form className="auth-form admin-form" onSubmit={handleCreateTopic}>
          <div className="form-heading">
            <p className="small-heading">MODULES</p>
            <h2>Add Topic / Module</h2>
          </div>

          <label>
            Select Course
            <select
              value={selectedTopicCourseId}
              onChange={(event) => setSelectedTopicCourseId(event.target.value)}
            >
              <option value="">Choose a course</option>

              {courses.map((course) => (
                <option value={course.id} key={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Topic Title
            <input
              type="text"
              value={topicForm.title}
              onChange={(event) =>
                setTopicForm({ ...topicForm, title: event.target.value })
              }
              placeholder="Example: HTML Introduction"
            />
          </label>

          <label>
            Topic Description
            <textarea
              value={topicForm.description}
              onChange={(event) =>
                setTopicForm({ ...topicForm, description: event.target.value })
              }
              placeholder="What will students learn in this topic?"
            />
          </label>

          <button type="submit" className="primary-button">
            Create Topic
          </button>
        </form>

        <form className="auth-form admin-form" onSubmit={handleSaveLesson}>
          <div className="form-heading">
            <p className="small-heading">
              {editingLessonId ? "EDIT LESSON" : "LESSONS"}
            </p>
            <h2>{editingLessonId ? "Edit Lesson" : "Add Lesson"}</h2>
          </div>

          <label>
            Select Course
            <select
              value={selectedLessonCourseId}
              disabled={editingLessonId !== null}
              onChange={(event) => {
                setSelectedLessonCourseId(event.target.value);
                setLessonForm({ ...lessonForm, topicId: null });
              }}
            >
              <option value="">Choose a course</option>

              {courses.map((course) => (
                <option value={course.id} key={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Select Topic / Module
            <select
              value={lessonForm.topicId || ""}
              onChange={(event) =>
                setLessonForm({
                  ...lessonForm,
                  topicId: event.target.value ? Number(event.target.value) : null,
                })
              }
            >
              <option value="">No topic / Ungrouped lesson</option>

              {selectedLessonCourse?.topics.map((topic) => (
                <option value={topic.id} key={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Lesson Title
            <input
              type="text"
              value={lessonForm.title}
              onChange={(event) =>
                setLessonForm({ ...lessonForm, title: event.target.value })
              }
              placeholder="Example: What is HTML?"
            />
          </label>

          <label>
            Short Description
            <textarea
              value={lessonForm.description}
              onChange={(event) =>
                setLessonForm({
                  ...lessonForm,
                  description: event.target.value,
                })
              }
              placeholder="Write a short lesson summary"
            />
          </label>

          <label>
            Full Lesson Content
            <textarea
              className="lesson-content-textarea"
              value={lessonForm.content}
              onChange={(event) =>
                setLessonForm({
                  ...lessonForm,
                  content: event.target.value,
                })
              }
              placeholder="Write full lesson notes, examples, explanation or code here..."
            />
          </label>

          <label>
            Duration
            <input
              type="text"
              value={lessonForm.duration}
              onChange={(event) =>
                setLessonForm({ ...lessonForm, duration: event.target.value })
              }
              placeholder="10 min"
            />
          </label>

          <button type="submit" className="primary-button">
            {editingLessonId ? "Update Lesson" : "Add Lesson"}
          </button>

          {editingLessonId && (
            <button
              type="button"
              className="secondary-button full-width-button"
              onClick={resetLessonForm}
            >
              Cancel Lesson Edit
            </button>
          )}
        </form>
      </div>

      <div className="admin-course-panel">
        <div className="lessons-heading">
          <h2>Curriculum Structure</h2>
          <p>View topics, lessons and lesson content status.</p>
        </div>

        {courses.length === 0 && !isLoading ? (
          <div className="empty-dashboard-card">
            <h2>No courses available</h2>
            <p>Create a course first, then add topics and lessons.</p>
          </div>
        ) : (
          <div className="admin-course-management-list">
            {courses.map((course) => {
              const lessonsInsideTopics = new Set(
                course.topics.flatMap((topic) =>
                  topic.lessons.map((lesson) => lesson.id),
                ),
              );

              const ungroupedLessons = course.lessons.filter(
                (lesson) => !lessonsInsideTopics.has(lesson.id),
              );

              return (
                <article className="admin-course-management-card" key={course.id}>
                  <div className="admin-course-card-top">
                    <div className="course-icon">{course.shortName}</div>

                    <div>
                      <h3>{course.title}</h3>
                      <p>
                        {course.topics.length} topics • {course.lessons.length}{" "}
                        lessons
                      </p>
                    </div>
                  </div>

                  {course.topics.length > 0 && (
                    <div className="admin-lesson-list">
                      <h4>Topics / Modules</h4>

                      {course.topics.map((topic) => (
                        <div className="curriculum-topic-block" key={topic.id}>
                          <div className="curriculum-topic-heading">
                            <strong>
                              Module {topic.position}: {topic.title}
                            </strong>
                            <p>{topic.description}</p>
                            <small>{topic.lessons.length} lessons</small>
                          </div>

                          {topic.lessons.map((lesson) => (
                            <div className="admin-lesson-row" key={lesson.id}>
                              <div>
                                <strong>
                                  {lesson.position}. {lesson.title}
                                </strong>
                                <p>{lesson.duration}</p>
                                <small>
                                  {lesson.content
                                    ? "Content added"
                                    : "No content added"}
                                </small>
                              </div>

                              <div className="admin-lesson-actions">
                                <button
                                  type="button"
                                  className="secondary-button small-secondary-button"
                                  onClick={() => startEditingLesson(course, lesson)}
                                >
                                  Edit Lesson
                                </button>

                                <button
                                  type="button"
                                  className="danger-button small-danger-button"
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                >
                                  Delete Lesson
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {ungroupedLessons.length > 0 && (
                    <div className="admin-lesson-list">
                      <h4>Ungrouped Lessons</h4>

                      {ungroupedLessons.map((lesson) => (
                        <div className="admin-lesson-row" key={lesson.id}>
                          <div>
                            <strong>
                              {lesson.position}. {lesson.title}
                            </strong>
                            <p>{lesson.duration}</p>
                            <small>
                              {lesson.content ? "Content added" : "No content added"}
                            </small>
                          </div>

                          <div className="admin-lesson-actions">
                            <button
                              type="button"
                              className="secondary-button small-secondary-button"
                              onClick={() => startEditingLesson(course, lesson)}
                            >
                              Edit Lesson
                            </button>

                            <button
                              type="button"
                              className="danger-button small-danger-button"
                              onClick={() => handleDeleteLesson(lesson.id)}
                            >
                              Delete Lesson
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminCurriculumPage;