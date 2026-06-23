import type {
  CreateQuestionPayload,
  CreateQuizPayload,
  Quiz,
  QuizQuestion,
} from "../types/quiz";

const API_BASE_URL = "http://localhost:5000/api";

type AdminQuizzesResponse = {
  success: boolean;
  data: {
    quizzes: Quiz[];
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

export async function fetchAdminQuizzesByCourse(
  courseId: number,
  token: string,
): Promise<Quiz[]> {
  const response = await fetch(`${API_BASE_URL}/quizzes/admin/courses/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: AdminQuizzesResponse = await response.json();

  return result.data.quizzes;
}

export async function createQuizForCourse(
  courseId: number,
  payload: CreateQuizPayload,
  token: string,
): Promise<Quiz> {
  const response = await fetch(`${API_BASE_URL}/quizzes/admin/courses/${courseId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

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
  const response = await fetch(`${API_BASE_URL}/quizzes/admin/${quizId}/questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

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
