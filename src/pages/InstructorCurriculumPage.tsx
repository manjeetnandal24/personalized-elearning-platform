import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  createInstructorLesson,
  createInstructorTopic,
  deleteInstructorLesson,
  deleteInstructorTopic,
  fetchInstructorCurriculum,
  updateInstructorLesson,
  updateInstructorTopic,
  type InstructorCurriculumCourse,
  type InstructorCurriculumLesson,
  type InstructorCurriculumTopic,
} from "../api/instructorApi";
import { useAuth } from "../context/AuthContext";

type TopicForm = {
  title: string;
  description: string;
};

type LessonForm = {
  title: string;
  description: string;
  content: string;
  duration: string;
  topicId: string;
};

const emptyTopicForm: TopicForm = {
  title: "",
  description: "",
};

const emptyLessonForm: LessonForm = {
  title: "",
  description: "",
  content: "",
  duration: "",
  topicId: "",
};

function InstructorCurriculumPage() {
  const { token } = useAuth();

  const [courses, setCourses] = useState<InstructorCurriculumCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [topicForm, setTopicForm] = useState<TopicForm>(emptyTopicForm);
  const [lessonForm, setLessonForm] = useState<LessonForm>(emptyLessonForm);

  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const topicFormRef = useRef<HTMLFormElement | null>(null);
  const lessonFormRef = useRef<HTMLFormElement | null>(null);

  async function loadCurriculum() {
    if (!token) {
      setErrorMessage("Instructor token is missing.");
      setIsLoading(false);
      return;
    }

    try {
      setErrorMessage("");
      const data = await fetchInstructorCurriculum(token);
      setCourses(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load instructor curriculum.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCurriculum();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const selectedCourse = useMemo(() => {
    if (courses.length === 0) {
      return null;
    }

    const selectedId = Number(selectedCourseId);

    if (!selectedId) {
      return courses[0];
    }

    return courses.find((course) => course.id === selectedId) || courses[0];
  }, [courses, selectedCourseId]);

  const allSelectedCourseLessons = useMemo(() => {
    if (!selectedCourse) {
      return [];
    }

    const topicLessons = selectedCourse.topics.flatMap(
      (topic) => topic.lessons,
    );

    return [...topicLessons, ...selectedCourse.lessons].sort(
      (firstLesson, secondLesson) =>
        firstLesson.position - secondLesson.position,
    );
  }, [selectedCourse]);

  function resetForms() {
    setTopicForm(emptyTopicForm);
    setLessonForm(emptyLessonForm);
    setEditingTopicId(null);
    setEditingLessonId(null);
  }

  async function handleTopicSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !selectedCourse) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (editingTopicId) {
        await updateInstructorTopic(token, editingTopicId, topicForm);
        setSuccessMessage("Topic updated successfully.");
      } else {
        await createInstructorTopic(token, {
          courseId: selectedCourse.id,
          title: topicForm.title,
          description: topicForm.description,
        });
        setSuccessMessage("Topic created successfully.");
      }

      resetForms();
      await loadCurriculum();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save topic.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLessonSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !selectedCourse) {
      return;
    }

    const parsedTopicId = lessonForm.topicId
      ? Number(lessonForm.topicId)
      : null;

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        courseId: selectedCourse.id,
        topicId: parsedTopicId,
        title: lessonForm.title,
        description: lessonForm.description,
        content: lessonForm.content,
        duration: lessonForm.duration,
      };

      if (editingLessonId) {
        await updateInstructorLesson(token, editingLessonId, payload);
        setSuccessMessage("Lesson updated successfully.");
      } else {
        await createInstructorLesson(token, payload);
        setSuccessMessage("Lesson created successfully.");
      }

      resetForms();
      await loadCurriculum();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save lesson.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTopic(topic: InstructorCurriculumTopic) {
    if (!token) {
      return;
    }

    const shouldDelete = window.confirm(
      `Delete topic "${topic.title}"? Lessons inside it will become ungrouped.`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteInstructorTopic(token, topic.id);
      setSuccessMessage("Topic deleted successfully.");
      await loadCurriculum();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete topic.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteLesson(lesson: InstructorCurriculumLesson) {
    if (!token) {
      return;
    }

    const shouldDelete = window.confirm(`Delete lesson "${lesson.title}"?`);

    if (!shouldDelete) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteInstructorLesson(token, lesson.id);
      setSuccessMessage("Lesson deleted successfully.");
      await loadCurriculum();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete lesson.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function startEditingTopic(topic: InstructorCurriculumTopic) {
    setEditingTopicId(topic.id);
    setTopicForm({
      title: topic.title,
      description: topic.description,
    });
    setEditingLessonId(null);

    window.setTimeout(() => {
      topicFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function startEditingLesson(lesson: InstructorCurriculumLesson) {
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      duration: lesson.duration,
      topicId: lesson.topicId ? String(lesson.topicId) : "",
    });
    setEditingTopicId(null);

    window.setTimeout(() => {
      lessonFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  return (
    <section className="admin-page">
      <div className="admin-hero-card instructor-hero-card">
        <div>
          <p className="small-heading">INSTRUCTOR CURRICULUM</p>
          <h1>Manage Curriculum</h1>
          <p>
            Add topics and lessons for your assigned courses only. Students will
            see these lessons inside the course detail page.
          </p>
        </div>
      </div>

      {isLoading && <p className="status-text">Loading curriculum...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}
      {successMessage && <p className="success-text">{successMessage}</p>}

      {!isLoading && !errorMessage && courses.length === 0 && (
        <div className="empty-dashboard-card">
          <h2>No courses assigned yet</h2>
          <p>Ask the admin to assign courses to your instructor account.</p>
        </div>
      )}

      {!isLoading && courses.length > 0 && selectedCourse && (
        <>
          <div className="student-management-toolbar">
            <label>
              Select Course
              <select
                value={selectedCourseId || String(selectedCourse.id)}
                onChange={(event) => {
                  setSelectedCourseId(event.target.value);
                  resetForms();
                }}
              >
                {courses.map((course) => (
                  <option value={course.id} key={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>

            <p>
              <strong>{selectedCourse.topics.length}</strong> topics •{" "}
              <strong>{allSelectedCourseLessons.length}</strong> lessons
            </p>
          </div>

          <div className="instructor-curriculum-layout">
            <div className="instructor-form-stack">
              <form
                ref={topicFormRef}
                className="instructor-curriculum-form"
                onSubmit={handleTopicSubmit}
              >
                <div>
                  <p className="small-heading">TOPIC FORM</p>
                  <h2>{editingTopicId ? "Edit Topic" : "Add Topic"}</h2>
                </div>

                <label>
                  Topic Title
                  <input
                    type="text"
                    value={topicForm.title}
                    onChange={(event) =>
                      setTopicForm((currentForm) => ({
                        ...currentForm,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Example: Introduction to React"
                    required
                  />
                </label>

                <label>
                  Topic Description
                  <textarea
                    value={topicForm.description}
                    onChange={(event) =>
                      setTopicForm((currentForm) => ({
                        ...currentForm,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Short topic description..."
                    rows={3}
                  />
                </label>

                <div className="instructor-form-actions">
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={isSaving}
                  >
                    {editingTopicId ? "Update Topic" : "Create Topic"}
                  </button>

                  {editingTopicId && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={resetForms}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <form
                ref={lessonFormRef}
                className="instructor-curriculum-form"
                onSubmit={handleLessonSubmit}
              >
                <div>
                  <p className="small-heading">LESSON FORM</p>
                  <h2>{editingLessonId ? "Edit Lesson" : "Add Lesson"}</h2>
                </div>

                <label>
                  Lesson Topic
                  <select
                    value={lessonForm.topicId}
                    onChange={(event) =>
                      setLessonForm((currentForm) => ({
                        ...currentForm,
                        topicId: event.target.value,
                      }))
                    }
                  >
                    <option value="">Ungrouped Lesson</option>
                    {selectedCourse.topics.map((topic) => (
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
                      setLessonForm((currentForm) => ({
                        ...currentForm,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Example: What is React?"
                    required
                  />
                </label>

                <label>
                  Lesson Description
                  <textarea
                    value={lessonForm.description}
                    onChange={(event) =>
                      setLessonForm((currentForm) => ({
                        ...currentForm,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Short lesson description..."
                    rows={3}
                    required
                  />
                </label>

                <label>
                  Lesson Content
                  <textarea
                    value={lessonForm.content}
                    onChange={(event) =>
                      setLessonForm((currentForm) => ({
                        ...currentForm,
                        content: event.target.value,
                      }))
                    }
                    placeholder="Write lesson notes/content here..."
                    rows={5}
                  />
                </label>

                <label>
                  Duration
                  <input
                    type="text"
                    value={lessonForm.duration}
                    onChange={(event) =>
                      setLessonForm((currentForm) => ({
                        ...currentForm,
                        duration: event.target.value,
                      }))
                    }
                    placeholder="Example: 20 min"
                    required
                  />
                </label>

                <div className="instructor-form-actions">
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={isSaving}
                  >
                    {editingLessonId ? "Update Lesson" : "Create Lesson"}
                  </button>

                  {editingLessonId && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={resetForms}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="instructor-curriculum-preview">
              <div className="section-heading-row">
                <div>
                  <p className="small-heading">COURSE STRUCTURE</p>
                  <h2>{selectedCourse.title}</h2>
                </div>
              </div>

              {selectedCourse.topics.length === 0 &&
                selectedCourse.lessons.length === 0 && (
                  <div className="empty-dashboard-card">
                    <h2>No curriculum yet</h2>
                    <p>Create topics and lessons from the left side forms.</p>
                  </div>
                )}

              <div className="curriculum-topic-list">
                {selectedCourse.topics.map((topic) => (
                  <article className="curriculum-topic-card" key={topic.id}>
                    <div className="curriculum-topic-header">
                      <div>
                        <h3>{topic.title}</h3>
                        <p>{topic.description || "No description added."}</p>
                      </div>

                      <div className="curriculum-actions">
                        <button
                          type="button"
                          onClick={() => startEditingTopic(topic)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTopic(topic)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {topic.lessons.length === 0 ? (
                      <p className="status-text left-status-text">
                        No lessons in this topic yet.
                      </p>
                    ) : (
                      <div className="curriculum-lesson-list">
                        {topic.lessons.map((lesson) => (
                          <div
                            className="curriculum-lesson-row"
                            key={lesson.id}
                          >
                            <div>
                              <strong>{lesson.title}</strong>
                              <p>
                                {lesson.duration} • {lesson.description}
                              </p>
                            </div>

                            <div className="curriculum-actions">
                              <button
                                type="button"
                                onClick={() => startEditingLesson(lesson)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteLesson(lesson)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                ))}

                {selectedCourse.lessons.length > 0 && (
                  <article className="curriculum-topic-card">
                    <div className="curriculum-topic-header">
                      <div>
                        <h3>Ungrouped Lessons</h3>
                        <p>Lessons not assigned to any topic.</p>
                      </div>
                    </div>

                    <div className="curriculum-lesson-list">
                      {selectedCourse.lessons.map((lesson) => (
                        <div className="curriculum-lesson-row" key={lesson.id}>
                          <div>
                            <strong>{lesson.title}</strong>
                            <p>
                              {lesson.duration} • {lesson.description}
                            </p>
                          </div>

                          <div className="curriculum-actions">
                            <button
                              type="button"
                              onClick={() => startEditingLesson(lesson)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteLesson(lesson)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default InstructorCurriculumPage;