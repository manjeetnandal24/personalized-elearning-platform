export type QuizQuestion = {
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
