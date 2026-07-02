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