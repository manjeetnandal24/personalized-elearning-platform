const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export type EnrollmentStatus = {
  courseId: number;
  courseTitle: string;
  isEnrolled: boolean;
  enrolledAt: string | null;
};

export async function fetchEnrollmentStatus(
  courseId: number,
  token: string,
): Promise<EnrollmentStatus> {
  const response = await fetch(
    `${API_BASE_URL}/enrollments/courses/${courseId}/status`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to check enrollment status.");
  }

  return data;
}

export async function enrollInCourse(courseId: number, token: string) {
  const response = await fetch(`${API_BASE_URL}/enrollments/courses/${courseId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to enroll in course.");
  }

  return data;
}