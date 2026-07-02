const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export type AdminStudentCourseProgress = {
  enrollmentId: number;
  enrolledAt: string;
  courseId: number;
  courseTitle: string;
  courseShortName: string;
  courseLevel: string;
  courseCategory: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
};

export type AdminStudentCertificate = {
  id: number;
  courseId: number;
  certificateCode: string;
  issuedAt: string;
};

export type AdminStudent = {
  id: number;
  name: string;
  email: string;
  joinedAt: string;
  enrolledCoursesCount: number;
  completedLessonsCount: number;
  quizAttempts: number;
  passedQuizAttempts: number;
  averageQuizScore: number;
  certificatesCount: number;
  certificates: AdminStudentCertificate[];
  enrolledCourses: AdminStudentCourseProgress[];
};

export async function fetchAdminStudents(token: string): Promise<AdminStudent[]> {
  const response = await fetch(`${API_BASE_URL}/admin/students`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load students.");
  }

  return data.data.students;
}