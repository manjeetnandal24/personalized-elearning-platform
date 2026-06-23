export type QuizQuestion = {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption?: string;
  explanation?: string;
  points: number;
  position: number;
  quizId?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type QuizTopic = {
  id: number;
  title: string;
  position: number;
};

export type Quiz = {
  id: number;
  title: string;
  description: string;
  passingScore: number;
  courseId: number;
  topicId?: number | null;
  topic?: QuizTopic | null;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
};

export type CreateQuizPayload = {
  title: string;
  description: string;
  passingScore: number;
  topicId?: number | null;
};

export type CreateQuestionPayload = {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string;
  points: number;
};

export type QuizAnswerPayload = {
  questionId: number;
  selectedOption: string;
};

export type CheckedQuizAnswer = {
  questionId: number;
  question: string;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
  explanation: string;
};

export type QuizAttempt = {
  id: number;
  quizId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  answers?: CheckedQuizAnswer[];
};

export type SavedQuizAttempt = {
  id: number;
  userId: number;
  quizId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  selectedAnswers: CheckedQuizAnswer[];
  createdAt: string;
  updatedAt: string;
  quiz: {
    id: number;
    title: string;
    passingScore: number;
    courseId: number;
    topicId?: number | null;
  };
};