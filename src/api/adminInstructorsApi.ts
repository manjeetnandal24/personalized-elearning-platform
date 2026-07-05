const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export type AdminInstructorAssignedCourse = {
  id: number;
  shortName: string;
  title: string;
  description: string;
  level: string;
  category: string;
  lessonsCount: number;
  studentsCount: number;
  quizzesCount: number;
  quizAttemptsCount: number;
  certificatesCount: number;
};

export type AdminInstructor = {
  id: number;
  name: string;
  email: string;
  role: "INSTRUCTOR";
  joinedAt: string;
  assignedCoursesCount: number;
  uniqueStudentsCount: number;
  lessonsCount: number;
  quizzesCount: number;
  quizAttemptsCount: number;
  certificatesCount: number;
  assignedCourses: AdminInstructorAssignedCourse[];
};

export type AdminPromotableStudent = {
  id: number;
  name: string;
  email: string;
  role: "STUDENT";
  createdAt: string;
};

export type AdminInstructorCourse = {
  id: number;
  shortName: string;
  title: string;
  description: string;
  level: string;
  category: string;
  instructor: string;
  instructorId: number | null;
  instructorUser: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  lessonsCount: number;
  studentsCount: number;
  quizzesCount: number;
  certificatesCount: number;
};

export type AdminInstructorStats = {
  instructorsCount: number;
  studentsAvailableToPromote: number;
  totalCourses: number;
  assignedCourses: number;
  unassignedCourses: number;
};

export type AdminInstructorOverview = {
  stats: AdminInstructorStats;
  instructors: AdminInstructor[];
  students: AdminPromotableStudent[];
  courses: AdminInstructorCourse[];
};

export async function fetchAdminInstructors(
  token: string,
): Promise<AdminInstructorOverview> {
  const response = await fetch(`${API_BASE_URL}/admin/instructors`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load instructors.");
  }

  return data.data;
}

export async function updateUserInstructorRole(
  token: string,
  userId: number,
  role: "STUDENT" | "INSTRUCTOR",
) {
  const response = await fetch(
    `${API_BASE_URL}/admin/instructors/users/${userId}/role`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update user role.");
  }

  return data.data.user;
}

export async function assignCourseInstructor(
  token: string,
  courseId: number,
  instructorId: number | null,
) {
  const response = await fetch(
    `${API_BASE_URL}/admin/instructors/courses/${courseId}/assign`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ instructorId }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to assign instructor.");
  }

  return data.data.course;
}