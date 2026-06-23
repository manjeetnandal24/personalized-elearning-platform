import type {
  CreateQuestionPayload,
  CreateQuizPayload,
  Quiz,
  QuizAnswerPayload,
  QuizAttempt,
  QuizQuestion,
  SavedQuizAttempt,
} from "../types/quiz";

const API_BASE_URL = "http://localhost:5000/api";

type QuizzesResponse = {
  success: boolean;
  data: {
    quizzes: Quiz[];
  };
};

type QuizAttemptsResponse = {
  success: boolean;
  data: {
    attempts: SavedQuizAttempt[];
  };
};

async function getErrorMessage(response: Response) {
  try {
    const data: { message?: string } = await response.json();
    return data.message || "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}

export async function fetchQuizzesByCourse(courseId: number): Promise<Quiz[]> {
  const response = await fetch(`${API_BASE_URL}/quizzes/courses/${courseId}`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: QuizzesResponse = await response.json();

  return result.data.quizzes;
}

export async function fetchAdminQuizzesByCourse(
  courseId: number,
  token: string,
): Promise<Quiz[]> {
  const response = await fetch(
    `${API_BASE_URL}/quizzes/admin/courses/${courseId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: QuizzesResponse = await response.json();

  return result.data.quizzes;
}

export async function createQuizForCourse(
  courseId: number,
  payload: CreateQuizPayload,
  token: string,
): Promise<Quiz> {
  const response = await fetch(
    `${API_BASE_URL}/quizzes/admin/courses/${courseId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: {
    success: boolean;
    message: string;
    data: {
      quiz: Quiz;
    };
  } = await response.json();

  return result.data.quiz;
}

export async function addQuestionToQuiz(
  quizId: number,
  payload: CreateQuestionPayload,
  token: string,
): Promise<QuizQuestion> {
  const response = await fetch(
    `${API_BASE_URL}/quizzes/admin/${quizId}/questions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: {
    success: boolean;
    message: string;
    data: {
      question: QuizQuestion;
    };
  } = await response.json();

  return result.data.question;
}

export async function submitQuizAttempt(
  quizId: number,
  answers: QuizAnswerPayload[],
  token: string,
): Promise<QuizAttempt> {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      answers,
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: {
    success: boolean;
    message: string;
    data: {
      attempt: QuizAttempt;
    };
  } = await response.json();

  return result.data.attempt;
}

export async function fetchQuizAttemptsByCourse(
  courseId: number,
  token: string,
): Promise<SavedQuizAttempt[]> {
  const response = await fetch(`${API_BASE_URL}/quizzes/attempts/courses/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: QuizAttemptsResponse = await response.json();

  return result.data.attempts;
}