const API_BASE_URL = "http://localhost:5000/api";

export type CourseProgress = {
  courseId: number;
  completedLessonIds: number[];
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
};

type CourseProgressResponse = {
  success: boolean;
  data: CourseProgress;
};

type ToggleProgressResponse = {
  success: boolean;
  message: string;
  data: CourseProgress & {
    lessonId: number;
    isCompleted: boolean;
  };
};

async function getErrorMessage(response: Response) {
  try {
    const data: { message?: string } = await response.json();
    return data.message || "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}

export async function fetchCourseProgress(
  courseId: number,
  token: string,
): Promise<CourseProgress> {
  const response = await fetch(`${API_BASE_URL}/progress/courses/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: CourseProgressResponse = await response.json();

  return result.data;
}

export async function toggleLessonProgress(
  lessonId: number,
  token: string,
): Promise<ToggleProgressResponse["data"]> {
  const response = await fetch(
    `${API_BASE_URL}/progress/lessons/${lessonId}/toggle`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: ToggleProgressResponse = await response.json();

  return result.data;
}