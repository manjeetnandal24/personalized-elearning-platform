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

export type DashboardData = {
  enrolledCourses: number;
  completedLessons: number;
  totalLessons: number;
  overallProgress: number;
  continueLearning: DashboardCourse | null;
  courses: DashboardCourse[];
};

export type DashboardResponse = {
  success: boolean;
  data: DashboardData;
};