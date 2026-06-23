import { useEffect, useState, type FormEvent } from "react";

import {
  addQuestionToQuiz,
  createQuizForCourse,
  fetchAdminQuizzesByCourse,
} from "../api/quizApi";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types/course";
import type { CreateQuestionPayload, CreateQuizPayload, Quiz } from "../types/quiz";

type AdminQuizBuilderProps = {
  courses: Course[];
};

const emptyQuizForm: CreateQuizPayload = {
  title: "",
  description: "",
  passingScore: 60,
  topicId: null,
};

const emptyQuestionForm: CreateQuestionPayload = {
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "A",
  explanation: "",
  points: 1,
};

function AdminQuizBuilder({ courses }: AdminQuizBuilderProps) {
  const { token } = useAuth();

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState("");

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizForm, setQuizForm] = useState<CreateQuizPayload>(emptyQuizForm);
  const [questionForm, setQuestionForm] =
    useState<CreateQuestionPayload>(emptyQuestionForm);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedCourse = courses.find(
    (course) => course.id === Number(selectedCourseId),
  );

  useEffect(() => {
    async function loadQuizzes() {
      if (!token || !selectedCourseId) {
        setQuizzes([]);
        setSelectedQuizId("");
        return;
      }

      try {
        setIsLoading(true);
        setMessage("");
        setErrorMessage("");

        const data = await fetchAdminQuizzesByCourse(
          Number(selectedCourseId),
          token,
        );

        setQuizzes(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load quizzes.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadQuizzes();
  }, [selectedCourseId, token]);

  async function refreshQuizzes() {
    if (!token || !selectedCourseId) {
      return;
    }

    const data = await fetchAdminQuizzesByCourse(Number(selectedCourseId), token);
    setQuizzes(data);
  }

  async function handleCreateQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !selectedCourseId) {
      setErrorMessage("Please select a course first.");
      return;
    }

    try {
      setMessage("");
      setErrorMessage("");

      const newQuiz = await createQuizForCourse(
        Number(selectedCourseId),
        quizForm,
        token,
      );

      setQuizzes((currentQuizzes) => [...currentQuizzes, newQuiz]);
      setSelectedQuizId(String(newQuiz.id));
      setQuizForm(emptyQuizForm);

      setMessage("Quiz created successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create quiz.",
      );
    }
  }

  async function handleAddQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !selectedQuizId) {
      setErrorMessage("Please select a quiz first.");
      return;
    }

    try {
      setMessage("");
      setErrorMessage("");

      await addQuestionToQuiz(Number(selectedQuizId), questionForm, token);
      await refreshQuizzes();

      setQuestionForm(emptyQuestionForm);
      setMessage("Question added successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to add question.",
      );
    }
  }

  return (
    <section className="admin-quiz-section">
      <div className="lessons-heading">
        <h2>Quiz Builder</h2>
        <p>Create quizzes and MCQ questions for course assessments.</p>
      </div>

      {message && <p className="status-text">{message}</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}
      {isLoading && <p className="status-text">Loading quizzes...</p>}

      <div className="admin-grid">
        <form className="auth-form admin-form" onSubmit={handleCreateQuiz}>
          <div className="form-heading">
            <p className="small-heading">ASSESSMENT</p>
            <h2>Create Quiz</h2>
          </div>

          <label>
            Select Course
            <select
              value={selectedCourseId}
              onChange={(event) => {
                setSelectedCourseId(event.target.value);
                setSelectedQuizId("");
                setQuizForm(emptyQuizForm);
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
              value={quizForm.topicId || ""}
              onChange={(event) =>
                setQuizForm({
                  ...quizForm,
                  topicId: event.target.value ? Number(event.target.value) : null,
                })
              }
            >
              <option value="">No topic / Course-level quiz</option>

              {selectedCourse?.topics.map((topic) => (
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
                setQuizForm({ ...quizForm, title: event.target.value })
              }
              placeholder="Example: HTML Basics Quiz"
            />
          </label>

          <label>
            Quiz Description
            <textarea
              value={quizForm.description}
              onChange={(event) =>
                setQuizForm({ ...quizForm, description: event.target.value })
              }
              placeholder="Write what this quiz will test"
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
                setQuizForm({
                  ...quizForm,
                  passingScore: Number(event.target.value),
                })
              }
            />
          </label>

          <button type="submit" className="primary-button">
            Create Quiz
          </button>
        </form>

        <form className="auth-form admin-form" onSubmit={handleAddQuestion}>
          <div className="form-heading">
            <p className="small-heading">QUESTIONS</p>
            <h2>Add MCQ Question</h2>
          </div>

          <label>
            Select Quiz
            <select
              value={selectedQuizId}
              onChange={(event) => setSelectedQuizId(event.target.value)}
            >
              <option value="">Choose a quiz</option>

              {quizzes.map((quiz) => (
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
                setQuestionForm({
                  ...questionForm,
                  question: event.target.value,
                })
              }
              placeholder="Example: What does HTML stand for?"
            />
          </label>

          <label>
            Option A
            <input
              type="text"
              value={questionForm.optionA}
              onChange={(event) =>
                setQuestionForm({ ...questionForm, optionA: event.target.value })
              }
              placeholder="Hyper Text Markup Language"
            />
          </label>

          <label>
            Option B
            <input
              type="text"
              value={questionForm.optionB}
              onChange={(event) =>
                setQuestionForm({ ...questionForm, optionB: event.target.value })
              }
              placeholder="High Text Machine Language"
            />
          </label>

          <label>
            Option C
            <input
              type="text"
              value={questionForm.optionC}
              onChange={(event) =>
                setQuestionForm({ ...questionForm, optionC: event.target.value })
              }
              placeholder="Hyper Tool Markup Language"
            />
          </label>

          <label>
            Option D
            <input
              type="text"
              value={questionForm.optionD}
              onChange={(event) =>
                setQuestionForm({ ...questionForm, optionD: event.target.value })
              }
              placeholder="Home Text Markup Language"
            />
          </label>

          <label>
            Correct Option
            <select
              value={questionForm.correctOption}
              onChange={(event) =>
                setQuestionForm({
                  ...questionForm,
                  correctOption: event.target.value,
                })
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
                setQuestionForm({
                  ...questionForm,
                  explanation: event.target.value,
                })
              }
              placeholder="Explain why the correct option is right"
            />
          </label>

          <label>
            Points
            <input
              type="number"
              min="1"
              value={questionForm.points}
              onChange={(event) =>
                setQuestionForm({
                  ...questionForm,
                  points: Number(event.target.value),
                })
              }
            />
          </label>

          <button type="submit" className="primary-button">
            Add Question
          </button>
        </form>
      </div>

      {selectedCourseId && (
        <div className="admin-quiz-list">
          <h3>Quizzes for selected course</h3>

          {quizzes.length === 0 ? (
            <div className="empty-dashboard-card">
              <h2>No quizzes added yet</h2>
              <p>Create the first quiz using the form above.</p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <article className="admin-quiz-card" key={quiz.id}>
                <div>
                  <p className="small-heading">
                    {quiz.topic ? `MODULE: ${quiz.topic.title}` : "COURSE QUIZ"}
                  </p>
                  <h3>{quiz.title}</h3>
                  <p>{quiz.description}</p>
                  <p>
                    Passing Score: <strong>{quiz.passingScore}%</strong> •{" "}
                    Questions: <strong>{quiz.questions.length}</strong>
                  </p>
                </div>

                {quiz.questions.length > 0 && (
                  <div className="admin-question-list">
                    {quiz.questions.map((question) => (
                      <div className="admin-question-row" key={question.id}>
                        <strong>
                          {question.position}. {question.question}
                        </strong>
                        <p>
                          Correct Option: <b>{question.correctOption}</b>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}

export default AdminQuizBuilder;
