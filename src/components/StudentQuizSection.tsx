import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  fetchQuizAttemptsByCourse,
  fetchQuizzesByCourse,
  submitQuizAttempt,
} from "../api/quizApi";
import { useAuth } from "../context/AuthContext";
import type {
  Quiz,
  QuizAnswerPayload,
  QuizAttempt,
  SavedQuizAttempt,
} from "../types/quiz";

type StudentQuizSectionProps = {
  courseId: number;
};

type SelectedAnswersState = Record<number, Record<number, string>>;
type AttemptResultState = Record<number, QuizAttempt>;

function StudentQuizSection({ courseId }: StudentQuizSectionProps) {
  const { isAuthenticated, token, user } = useAuth();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswersState>(
    {},
  );
  const [attemptResults, setAttemptResults] = useState<AttemptResultState>({});
  const [savedAttempts, setSavedAttempts] = useState<SavedQuizAttempt[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [submittingQuizId, setSubmittingQuizId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  const isAdmin = user?.role === "ADMIN";
  const canAttemptQuiz = isAuthenticated && !isAdmin;

  useEffect(() => {
    async function loadQuizzes() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await fetchQuizzesByCourse(courseId);
        setQuizzes(data);
      } catch {
        setErrorMessage("Unable to load quizzes.");
      } finally {
        setIsLoading(false);
      }
    }

    loadQuizzes();
  }, [courseId]);

  useEffect(() => {
    async function loadAttempts() {
      if (!token || !canAttemptQuiz) {
        setSavedAttempts([]);
        return;
      }

      try {
        const attempts = await fetchQuizAttemptsByCourse(courseId, token);
        setSavedAttempts(attempts);
      } catch {
        // Attempts are helpful, but quiz page should still work without them.
      }
    }

    loadAttempts();
  }, [courseId, token, canAttemptQuiz]);

  const latestAttemptByQuizId = useMemo(() => {
    const latestAttempts = new Map<number, SavedQuizAttempt>();

    for (const attempt of savedAttempts) {
      if (!latestAttempts.has(attempt.quizId)) {
        latestAttempts.set(attempt.quizId, attempt);
      }
    }

    return latestAttempts;
  }, [savedAttempts]);

  function handleSelectAnswer(
    quizId: number,
    questionId: number,
    selectedOption: string,
  ) {
    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [quizId]: {
        ...currentAnswers[quizId],
        [questionId]: selectedOption,
      },
    }));
  }

  async function handleSubmitQuiz(quiz: Quiz) {
    if (!token || !canAttemptQuiz) {
      return;
    }

    const quizAnswers = selectedAnswers[quiz.id] || {};

    const unansweredQuestion = quiz.questions.find(
      (question) => !quizAnswers[question.id],
    );

    if (unansweredQuestion) {
      setErrorMessage("Please answer all questions before submitting.");
      return;
    }

    const answers: QuizAnswerPayload[] = quiz.questions.map((question) => ({
      questionId: question.id,
      selectedOption: quizAnswers[question.id],
    }));

    try {
      setMessage("");
      setErrorMessage("");
      setSubmittingQuizId(quiz.id);

      const attempt = await submitQuizAttempt(quiz.id, answers, token);

      setAttemptResults((currentResults) => ({
        ...currentResults,
        [quiz.id]: attempt,
      }));

      const attempts = await fetchQuizAttemptsByCourse(courseId, token);
      setSavedAttempts(attempts);

      setMessage("Quiz submitted successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to submit quiz.",
      );
    } finally {
      setSubmittingQuizId(null);
    }
  }

  if (isLoading) {
    return (
      <section className="quiz-section">
        <p className="status-text">Loading quizzes...</p>
      </section>
    );
  }

  return (
    <section className="quiz-section">
      <div className="lessons-heading">
        <h2>Course Quizzes</h2>
        <p>Test your understanding after studying the lessons.</p>
      </div>

      {message && <p className="status-text">{message}</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {quizzes.length === 0 ? (
        <div className="empty-dashboard-card">
          <h2>No quizzes added yet</h2>
          <p>This course does not have any quiz assessment yet.</p>
        </div>
      ) : (
        <div className="quiz-list">
          {quizzes.map((quiz) => {
            const latestAttempt = latestAttemptByQuizId.get(quiz.id);
            const currentAttempt = attemptResults[quiz.id];

            return (
              <article className="quiz-card" key={quiz.id}>
                <div className="quiz-card-header">
                  <div>
                    <p className="small-heading">
                      {quiz.topic ? `MODULE: ${quiz.topic.title}` : "COURSE QUIZ"}
                    </p>
                    <h3>{quiz.title}</h3>
                    <p>{quiz.description}</p>
                  </div>

                  <div className="quiz-meta-box">
                    <strong>{quiz.questions.length}</strong>
                    <span>Questions</span>
                  </div>
                </div>

                <div className="quiz-info-row">
                  <span>Passing Score: {quiz.passingScore}%</span>

                  {latestAttempt && (
                    <span>
                      Last Score: {latestAttempt.score}%{" "}
                      {latestAttempt.passed ? "Passed" : "Failed"}
                    </span>
                  )}
                </div>

                {isAdmin && (
                  <div className="login-required-card compact-card">
                    <div>
                      <p className="small-heading">ADMIN VIEW</p>
                      <h2>Quiz attempt is disabled for admin.</h2>
                      <p>Students can attempt this quiz from their accounts.</p>
                    </div>
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="login-required-card compact-card">
                    <div>
                      <p className="small-heading">LOGIN REQUIRED</p>
                      <h2>Login to attempt this quiz.</h2>
                      <p>You can view the course content, but quiz attempts need login.</p>
                    </div>

                    <Link to="/login" className="course-link login-required-link">
                      Login
                    </Link>
                  </div>
                )}

                {canAttemptQuiz && quiz.questions.length === 0 && (
                  <div className="empty-dashboard-card">
                    <h2>No questions added</h2>
                    <p>This quiz has no questions yet.</p>
                  </div>
                )}

                {canAttemptQuiz && quiz.questions.length > 0 && (
                  <div className="quiz-question-list">

                   {quiz.questions.map((question, questionIndex) => {
                      const chosenOption =
                        selectedAnswers[quiz.id]?.[question.id] || "";

                      return (
                        <div className="quiz-question-card" key={question.id}>
                          <h4>
                           {questionIndex + 1}. {question.question}
                          </h4>

                          <div className="quiz-options">
                            {[
                              ["A", question.optionA],
                              ["B", question.optionB],
                              ["C", question.optionC],
                              ["D", question.optionD],
                            ].map(([optionKey, optionText]) => (
                              <label className="quiz-option" key={optionKey}>
                                <input
                                  type="radio"
                                  name={`quiz-${quiz.id}-question-${question.id}`}
                                  value={optionKey}
                                  checked={chosenOption === optionKey}
                                  onChange={() =>
                                    handleSelectAnswer(
                                      quiz.id,
                                      question.id,
                                      optionKey,
                                    )
                                  }
                                />

                                <span>
                                  <strong>{optionKey}.</strong> {optionText}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      className="primary-button quiz-submit-button"
                      disabled={submittingQuizId === quiz.id}
                      onClick={() => handleSubmitQuiz(quiz)}
                    >
                      {submittingQuizId === quiz.id
                        ? "Submitting..."
                        : "Submit Quiz"}
                    </button>
                  </div>
                )}

                {currentAttempt && (
                  <div
                    className={
                      currentAttempt.passed
                        ? "quiz-result-card passed-result"
                        : "quiz-result-card failed-result"
                    }
                  >
                    <h3>{currentAttempt.passed ? "Quiz Passed" : "Quiz Failed"}</h3>

                    <p>
                      Score: <strong>{currentAttempt.score}%</strong> • Correct:{" "}
                      <strong>
                        {currentAttempt.correctAnswers}/
                        {currentAttempt.totalQuestions}
                      </strong>
                    </p>

                    {currentAttempt.answers && (
                      <div className="quiz-review-list">
                        {currentAttempt.answers.map((answer) => (
                          <div className="quiz-review-row" key={answer.questionId}>
                            <strong>{answer.question}</strong>
                            <p>
                              Your answer: {answer.selectedOption || "Not answered"} •
                              Correct: {answer.correctOption}
                            </p>
                            <p>{answer.isCorrect ? "Correct" : "Incorrect"}</p>
                            {answer.explanation && <small>{answer.explanation}</small>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default StudentQuizSection;
