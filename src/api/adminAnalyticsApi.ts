const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export type AdminAnalyticsTotals = {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  totalCertificates: number;
  totalQuizAttempts: number;
  averageQuizScore: number;
};

export type AdminCourseAnalytics = {
  id: number;
  title: string;
  shortName: string;
  level: string;
  instructor: string;
  enrollments: number;
  certificatesIssued: number;
  lessons: number;
  topics: number;
  quizzes: number;
  quizAttempts: number;
  passedQuizAttempts: number;
  averageQuizScore: number;
};

export type AdminAnalyticsData = {
  totals: AdminAnalyticsTotals;
  highlights: {
    topEnrollmentCourse: AdminCourseAnalytics | null;
    topCertificateCourse: AdminCourseAnalytics | null;
    topQuizCourse: AdminCourseAnalytics | null;
  };
  courses: AdminCourseAnalytics[];
};

export async function fetchAdminAnalytics(
  token: string,
): Promise<AdminAnalyticsData> {
  const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load admin analytics.");
  }

  return data.data;
}