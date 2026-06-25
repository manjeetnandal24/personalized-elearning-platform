export type DashboardCourse = {
  id: number;
  title: string;
  shortName: string;
  level: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  enrolledAt: string;
};

export type DashboardQuizAttempt = {
  id: number;
  quizId: number;
  quizTitle: string;
  courseId: number;
  courseTitle: string;
  courseShortName: string;
  topicTitle: string | null;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  createdAt: string;
};

export type DashboardQuizAnalytics = {
  totalAttempts: number;
  uniqueQuizzesAttempted: number;
  passedAttempts: number;
  failedAttempts: number;
  averageScore: number;
  recentAttempts: DashboardQuizAttempt[];
};

export type DashboardData = {
  enrolledCourses: number;
  completedLessons: number;
  totalLessons: number;
  overallProgress: number;
  continueLearning: DashboardCourse | null;
  courses: DashboardCourse[];
  quizAnalytics: DashboardQuizAnalytics;
};

export type DashboardResponse = {
  success: boolean;
  data: DashboardData;
};