const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export type InstructorOverviewStats = {
  coursesCount: number;
  studentsCount: number;
  quizAttemptsCount: number;
  averageQuizScore: number;
  averageProgress: number;
  certificatesCount: number;
};

export type InstructorCourseOverview = {
  id: number;
  shortName: string;
  title: string;
  description: string;
  level: string;
  category: string;
  lessonsCount: number;
  enrollmentsCount: number;
  quizzesCount: number;
  certificatesCount: number;
};

export type InstructorOverview = {
  stats: InstructorOverviewStats;
  courses: InstructorCourseOverview[];
};

export async function fetchInstructorOverview(
  token: string,
): Promise<InstructorOverview> {
  const response = await fetch(`${API_BASE_URL}/instructor/overview`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load instructor overview.");
  }

  return data.data;
}

export async function fetchInstructorCourses(
  token: string,
): Promise<InstructorCourseOverview[]> {
  const response = await fetch(`${API_BASE_URL}/instructor/courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load instructor courses.");
  }

  return data.data.courses;
}

export type InstructorCurriculumLesson = {
  id: number;
  title: string;
  description: string;
  content: string;
  duration: string;
  position: number;
  courseId: number;
  topicId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type InstructorCurriculumTopic = {
  id: number;
  title: string;
  description: string;
  position: number;
  courseId: number;
  createdAt: string;
  updatedAt: string;
  lessons: InstructorCurriculumLesson[];
};

export type InstructorCurriculumCourse = {
  id: number;
  shortName: string;
  title: string;
  description: string;
  level: string;
  category: string;
  instructor: string;
  instructorId: number | null;
  createdAt: string;
  updatedAt: string;
  topics: InstructorCurriculumTopic[];
  lessons: InstructorCurriculumLesson[];
};

export async function fetchInstructorCurriculum(
  token: string,
): Promise<InstructorCurriculumCourse[]> {
  const response = await fetch(`${API_BASE_URL}/instructor/curriculum`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load instructor curriculum.");
  }

  return data.data.courses;
}

export async function createInstructorTopic(
  token: string,
  payload: {
    courseId: number;
    title: string;
    description: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/instructor/topics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to create topic.");
  }

  return data.data.topic;
}

export async function updateInstructorTopic(
  token: string,
  topicId: number,
  payload: {
    title: string;
    description: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/instructor/topics/${topicId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update topic.");
  }

  return data.data.topic;
}

export async function deleteInstructorTopic(token: string, topicId: number) {
  const response = await fetch(`${API_BASE_URL}/instructor/topics/${topicId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete topic.");
  }

  return data;
}

export async function createInstructorLesson(
  token: string,
  payload: {
    courseId: number;
    topicId: number | null;
    title: string;
    description: string;
    content: string;
    duration: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/instructor/lessons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to create lesson.");
  }

  return data.data.lesson;
}

export async function updateInstructorLesson(
  token: string,
  lessonId: number,
  payload: {
    topicId: number | null;
    title: string;
    description: string;
    content: string;
    duration: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/instructor/lessons/${lessonId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update lesson.");
  }

  return data.data.lesson;
}

export async function deleteInstructorLesson(token: string, lessonId: number) {
  const response = await fetch(`${API_BASE_URL}/instructor/lessons/${lessonId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete lesson.");
  }

  return data;
}

export type InstructorStudentCertificate = {
  id: number;
  userId: number;
  courseId: number;
  certificateCode: string;
  issuedAt: string;
};

export type InstructorCourseStudent = {
  id: number;
  name: string;
  email: string;
  joinedAt: string;
  enrolledAt: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  quizAttempts: number;
  passedQuizAttempts: number;
  averageQuizScore: number;
  certificateEarned: boolean;
  certificate?: InstructorStudentCertificate;
};

export type InstructorStudentCourseGroup = {
  courseId: number;
  courseTitle: string;
  courseShortName: string;
  courseLevel: string;
  courseCategory: string;
  totalLessons: number;
  students: InstructorCourseStudent[];
};

export type InstructorStudentsStats = {
  assignedCourses: number;
  uniqueStudents: number;
  totalEnrollments: number;
  quizAttempts: number;
  certificates: number;
  averageProgress: number;
};

export type InstructorStudentsOverview = {
  stats: InstructorStudentsStats;
  courses: InstructorStudentCourseGroup[];
};

export async function fetchInstructorStudents(
  token: string,
): Promise<InstructorStudentsOverview> {
  const response = await fetch(`${API_BASE_URL}/instructor/students`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load instructor students.");
  }

  return data.data;
}

export type InstructorQuizTopic = {
  id: number;
  title: string;
  courseId?: number;
};

export type InstructorQuizQuestion = {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string;
  points: number;
  position: number;
  quizId: number;
  createdAt: string;
  updatedAt: string;
};

export type InstructorQuizAttempt = {
  id: number;
  score: number;
  passed: boolean;
};

export type InstructorQuiz = {
  id: number;
  title: string;
  description: string;
  passingScore: number;
  courseId: number;
  topicId: number | null;
  topic: InstructorQuizTopic | null;
  questions: InstructorQuizQuestion[];
  attempts: InstructorQuizAttempt[];
  createdAt: string;
  updatedAt: string;
};

export type InstructorQuizCourse = {
  id: number;
  shortName: string;
  title: string;
  description: string;
  level: string;
  category: string;
  instructor: string;
  instructorId: number | null;
  createdAt: string;
  updatedAt: string;
  topics: InstructorQuizTopic[];
  quizzes: InstructorQuiz[];
};

export async function fetchInstructorQuizzes(
  token: string,
): Promise<InstructorQuizCourse[]> {
  const response = await fetch(`${API_BASE_URL}/instructor/quizzes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load instructor quizzes.");
  }

  return data.data.courses;
}

export async function createInstructorQuiz(
  token: string,
  payload: {
    courseId: number;
    topicId: number | null;
    title: string;
    description: string;
    passingScore: number;
  },
) {
  const response = await fetch(`${API_BASE_URL}/instructor/quizzes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to create quiz.");
  }

  return data.data.quiz;
}

export async function updateInstructorQuiz(
  token: string,
  quizId: number,
  payload: {
    topicId: number | null;
    title: string;
    description: string;
    passingScore: number;
  },
) {
  const response = await fetch(`${API_BASE_URL}/instructor/quizzes/${quizId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update quiz.");
  }

  return data.data.quiz;
}

export async function deleteInstructorQuiz(token: string, quizId: number) {
  const response = await fetch(`${API_BASE_URL}/instructor/quizzes/${quizId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete quiz.");
  }

  return data;
}

export async function createInstructorQuizQuestion(
  token: string,
  payload: {
    quizId: number;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
    explanation: string;
    points: number;
  },
) {
  const response = await fetch(`${API_BASE_URL}/instructor/quiz-questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to create question.");
  }

  return data.data.question;
}

export async function updateInstructorQuizQuestion(
  token: string,
  questionId: number,
  payload: {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
    explanation: string;
    points: number;
  },
) {
  const response = await fetch(
    `${API_BASE_URL}/instructor/quiz-questions/${questionId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update question.");
  }

  return data.data.question;
}

export async function deleteInstructorQuizQuestion(
  token: string,
  questionId: number,
) {
  const response = await fetch(
    `${API_BASE_URL}/instructor/quiz-questions/${questionId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete question.");
  }

  return data;
}