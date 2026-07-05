import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  createInstructorQuiz,
  createInstructorQuizQuestion,
  deleteInstructorQuiz,
  deleteInstructorQuizQuestion,
  fetchInstructorQuizzes,
  updateInstructorQuiz,
  updateInstructorQuizQuestion,
  type InstructorQuiz,
  type InstructorQuizCourse,
  type InstructorQuizQuestion,
} from "../api/instructorApi";
import { useAuth } from "../context/AuthContext";

type QuizForm = {
  title: string;
  description: string;
  passingScore: string;
  topicId: string;
};

type QuestionForm = {
  quizId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string;
  points: string;
};

const emptyQuizForm: QuizForm = {
  title: "",
  description: "",
  passingScore: "60",
  topicId: "",
};

const emptyQuestionForm: QuestionForm = {
  quizId: "",
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "A",
  explanation: "",
  points: "1",
};

function InstructorQuizzesPage() {
  const { token } = useAuth();

  const [courses, setCourses] = useState<InstructorQuizCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [quizForm, setQuizForm] = useState<QuizForm>(emptyQuizForm);
  const [questionForm, setQuestionForm] =
    useState<QuestionForm>(emptyQuestionForm);

  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const quizFormRef = useRef<HTMLFormElement | null>(null);
  const questionFormRef = useRef<HTMLFormElement | null>(null);

  async function loadQuizzes() {
    if (!token) {
      setErrorMessage("Instructor token is missing.");
      setIsLoading(false);
      return;
    }

    try {
      setErrorMessage("");
      const data = await fetchInstructorQuizzes(token);
      setCourses(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load instructor quizzes.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadQuizzes();
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

  const totalQuizzes = courses.reduce(
    (total, course) => total + course.quizzes.length,
    0,
  );

  const totalQuestions = courses.reduce(
    (total, course) =>
      total +
      course.quizzes.reduce(
        (quizTotal, quiz) => quizTotal + quiz.questions.length,
        0,
      ),
    0,
  );

  const totalAttempts = courses.reduce(
    (total, course) =>
      total +
      course.quizzes.reduce(
        (quizTotal, quiz) => quizTotal + quiz.attempts.length,
        0,
      ),
    0,
  );

  function resetForms() {
    setQuizForm(emptyQuizForm);
    setQuestionForm(emptyQuestionForm);
    setEditingQuizId(null);
    setEditingQuestionId(null);
  }

  async function handleQuizSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !selectedCourse) {
      return;
    }

    const passingScore = Number(quizForm.passingScore);
    const topicId = quizForm.topicId ? Number(quizForm.topicId) : null;

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        courseId: selectedCourse.id,
        topicId,
        title: quizForm.title,
        description: quizForm.description,
        passingScore,
      };

      if (editingQuizId) {
        await updateInstructorQuiz(token, editingQuizId, payload);
        setSuccessMessage("Quiz updated successfully.");
      } else {
        await createInstructorQuiz(token, payload);
        setSuccessMessage("Quiz created successfully.");
      }

      resetForms();
      await loadQuizzes();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save quiz.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleQuestionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    const quizId = Number(questionForm.quizId);
    const points = Number(questionForm.points);

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        quizId,
        question: questionForm.question,
        optionA: questionForm.optionA,
        optionB: questionForm.optionB,
        optionC: questionForm.optionC,
        optionD: questionForm.optionD,
        correctOption: questionForm.correctOption,
        explanation: questionForm.explanation,
        points,
      };

      if (editingQuestionId) {
        await updateInstructorQuizQuestion(token, editingQuestionId, payload);
        setSuccessMessage("Question updated successfully.");
      } else {
        await createInstructorQuizQuestion(token, payload);
        setSuccessMessage("Question created successfully.");
      }

      setQuestionForm(emptyQuestionForm);
      setEditingQuestionId(null);
      await loadQuizzes();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save question.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteQuiz(quiz: InstructorQuiz) {
    if (!token) {
      return;
    }

    const shouldDelete = window.confirm(
      `Delete quiz "${quiz.title}"? Attempts and questions will also be deleted.`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteInstructorQuiz(token, quiz.id);
      setSuccessMessage("Quiz deleted successfully.");
      await loadQuizzes();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete quiz.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteQuestion(question: InstructorQuizQuestion) {
    if (!token) {
      return;
    }

    const shouldDelete = window.confirm(
      `Delete question "${question.question}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteInstructorQuizQuestion(token, question.id);
      setSuccessMessage("Question deleted successfully.");
      await loadQuizzes();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete question.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function startEditingQuiz(quiz: InstructorQuiz) {
    setEditingQuizId(quiz.id);
    setQuizForm({
      title: quiz.title,
      description: quiz.description,
      passingScore: String(quiz.passingScore),
      topicId: quiz.topicId ? String(quiz.topicId) : "",
    });

    setEditingQuestionId(null);

    window.setTimeout(() => {
      quizFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function startEditingQuestion(question: InstructorQuizQuestion) {
    setEditingQuestionId(question.id);
    setQuestionForm({
      quizId: String(question.quizId),
      question: question.question,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctOption: question.correctOption,
      explanation: question.explanation,
      points: String(question.points),
    });

    window.setTimeout(() => {
      questionFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  return (
    <section className="admin-page">
      <div className="admin-hero-card instructor-hero-card">
        <div>
          <p className="small-heading">INSTRUCTOR QUIZZES</p>
          <h1>Manage Quizzes</h1>
          <p>
            Create quizzes and questions for your assigned courses only. These
            quizzes will be available to enrolled students.
          </p>
        </div>
      </div>

      {isLoading && <p className="status-text">Loading quizzes...</p>}
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
          <div className="admin-stats-grid">
            <div className="dashboard-card">
              <p>Assigned Courses</p>
              <h2>{courses.length}</h2>
              <span>Your courses</span>
            </div>

            <div className="dashboard-card">
              <p>Total Quizzes</p>
              <h2>{totalQuizzes}</h2>
              <span>Created quizzes</span>
            </div>

            <div className="dashboard-card">
              <p>Total Questions</p>
              <h2>{totalQuestions}</h2>
              <span>Quiz questions</span>
            </div>

            <div className="dashboard-card">
              <p>Total Attempts</p>
              <h2>{totalAttempts}</h2>
              <span>Student attempts</span>
            </div>
          </div>

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
              <strong>{selectedCourse.quizzes.length}</strong> quizzes •{" "}
              <strong>
                {selectedCourse.quizzes.reduce(
                  (total, quiz) => total + quiz.questions.length,
                  0,
                )}
              </strong>{" "}
              questions
            </p>
          </div>

          <div className="instructor-curriculum-layout">
            <div className="instructor-form-stack">
              <form
                ref={quizFormRef}
                className="instructor-curriculum-form"
                onSubmit={handleQuizSubmit}
              >
                <div>
                  <p className="small-heading">QUIZ FORM</p>
                  <h2>{editingQuizId ? "Edit Quiz" : "Add Quiz"}</h2>
                </div>

                <label>
                  Topic
                  <select
                    value={quizForm.topicId}
                    onChange={(event) =>
                      setQuizForm((currentForm) => ({
                        ...currentForm,
                        topicId: event.target.value,
                      }))
                    }
                  >
                    <option value="">No specific topic</option>
                    {selectedCourse.topics.map((topic) => (
                      <option value={topic.id} key={topic.id}>
                        {topic.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Quiz Title
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(event) =>
                      setQuizForm((currentForm) => ({
                        ...currentForm,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Example: React Basics Quiz"
                    required
                  />
                </label>

                <label>
                  Description
                  <textarea
                    value={quizForm.description}
                    onChange={(event) =>
                      setQuizForm((currentForm) => ({
                        ...currentForm,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Short quiz description..."
                    rows={3}
                    required
                  />
                </label>

                <label>
                  Passing Score %
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quizForm.passingScore}
                    onChange={(event) =>
                      setQuizForm((currentForm) => ({
                        ...currentForm,
                        passingScore: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <div className="instructor-form-actions">
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={isSaving}
                  >
                    {editingQuizId ? "Update Quiz" : "Create Quiz"}
                  </button>

                  {editingQuizId && (
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
                ref={questionFormRef}
                className="instructor-curriculum-form"
                onSubmit={handleQuestionSubmit}
              >
                <div>
                  <p className="small-heading">QUESTION FORM</p>
                  <h2>
                    {editingQuestionId ? "Edit Question" : "Add Question"}
                  </h2>
                </div>

                <label>
                  Select Quiz
                  <select
                    value={questionForm.quizId}
                    onChange={(event) =>
                      setQuestionForm((currentForm) => ({
                        ...currentForm,
                        quizId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Choose quiz</option>
                    {selectedCourse.quizzes.map((quiz) => (
                      <option value={quiz.id} key={quiz.id}>
                        {quiz.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Question
                  <textarea
                    value={questionForm.question}
                    onChange={(event) =>
                      setQuestionForm((currentForm) => ({
                        ...currentForm,
                        question: event.target.value,
                      }))
                    }
                    placeholder="Write your question..."
                    rows={3}
                    required
                  />
                </label>

                <label>
                  Option A
                  <input
                    type="text"
                    value={questionForm.optionA}
                    onChange={(event) =>
                      setQuestionForm((currentForm) => ({
                        ...currentForm,
                        optionA: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label>
                  Option B
                  <input
                    type="text"
                    value={questionForm.optionB}
                    onChange={(event) =>
                      setQuestionForm((currentForm) => ({
                        ...currentForm,
                        optionB: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label>
                  Option C
                  <input
                    type="text"
                    value={questionForm.optionC}
                    onChange={(event) =>
                      setQuestionForm((currentForm) => ({
                        ...currentForm,
                        optionC: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label>
                  Option D
                  <input
                    type="text"
                    value={questionForm.optionD}
                    onChange={(event) =>
                      setQuestionForm((currentForm) => ({
                        ...currentForm,
                        optionD: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label>
                  Correct Option
                  <select
                    value={questionForm.correctOption}
                    onChange={(event) =>
                      setQuestionForm((currentForm) => ({
                        ...currentForm,
                        correctOption: event.target.value,
                      }))
                    }
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </label>

                <label>
                  Explanation
                  <textarea
                    value={questionForm.explanation}
                    onChange={(event) =>
                      setQuestionForm((currentForm) => ({
                        ...currentForm,
                        explanation: event.target.value,
                      }))
                    }
                    placeholder="Optional answer explanation..."
                    rows={3}
                  />
                </label>

                <label>
                  Points
                  <input
                    type="number"
                    min="1"
                    value={questionForm.points}
                    onChange={(event) =>
                      setQuestionForm((currentForm) => ({
                        ...currentForm,
                        points: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <div className="instructor-form-actions">
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={isSaving || selectedCourse.quizzes.length === 0}
                  >
                    {editingQuestionId ? "Update Question" : "Create Question"}
                  </button>

                  {editingQuestionId && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setQuestionForm(emptyQuestionForm);
                        setEditingQuestionId(null);
                      }}
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
                  <p className="small-heading">QUIZ STRUCTURE</p>
                  <h2>{selectedCourse.title}</h2>
                </div>
              </div>

              {selectedCourse.quizzes.length === 0 ? (
                <div className="empty-dashboard-card">
                  <h2>No quizzes yet</h2>
                  <p>Create a quiz first, then add questions to it.</p>
                </div>
              ) : (
                <div className="curriculum-topic-list">
                  {selectedCourse.quizzes.map((quiz) => (
                    <article className="curriculum-topic-card" key={quiz.id}>
                      <div className="curriculum-topic-header">
                        <div>
                          <p className="course-category-pill">
                            {quiz.topic?.title || "General Quiz"}
                          </p>
                          <h3>{quiz.title}</h3>
                          <p>
                            {quiz.description} • Passing score:{" "}
                            {quiz.passingScore}% • {quiz.attempts.length}{" "}
                            attempts
                          </p>
                        </div>

                        <div className="curriculum-actions">
                          <button
                            type="button"
                            onClick={() => startEditingQuiz(quiz)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteQuiz(quiz)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {quiz.questions.length === 0 ? (
                        <p className="status-text left-status-text">
                          No questions added yet.
                        </p>
                      ) : (
                        <div className="curriculum-lesson-list">
                          {quiz.questions.map((question, questionIndex) => (
                            <div
                              className="curriculum-lesson-row quiz-question-row"
                              key={question.id}
                            >
                              <div>
                                <strong>
                                 Q{questionIndex + 1}. {question.question}
                                </strong>

                                <p>A. {question.optionA}</p>
                                <p>B. {question.optionB}</p>
                                <p>C. {question.optionC}</p>
                                <p>D. {question.optionD}</p>

                                <p>
                                  Correct:{" "}
                                  <strong>{question.correctOption}</strong> •{" "}
                                  {question.points} point
                                  {question.points > 1 ? "s" : ""}
                                </p>

                                {question.explanation && (
                                  <p>Explanation: {question.explanation}</p>
                                )}
                              </div>

                              <div className="curriculum-actions">
                                <button
                                  type="button"
                                  onClick={() => startEditingQuestion(question)}
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteQuestion(question)}
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
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default InstructorQuizzesPage;