import type { Course, Lesson, Topic } from "../types/course";

const API_BASE_URL = "http://localhost:5000/api";

type AdminCoursesResponse = {
  success: boolean;
  data: {
    courses: Course[];
  };
};

type CreateCoursePayload = {
  title: string;
  description: string;
  shortName: string;
  level: string;
  instructor: string;
};

export type CourseFormPayload = CreateCoursePayload;

export type LessonFormPayload = {
  title: string;
  description: string;
  content: string;
  duration: string;
   topicId?: number | null;
};

export type TopicFormPayload = {
  title: string;
  description: string;
};

async function getErrorMessage(response: Response) {
  try {
    const data: { message?: string } = await response.json();
    return data.message || "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}

export async function fetchAdminCourses(token: string): Promise<Course[]> {
  const response = await fetch(`${API_BASE_URL}/admin/courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: AdminCoursesResponse = await response.json();

  return result.data.courses;
}

export async function createAdminCourse(
  payload: CourseFormPayload,
  token: string,
): Promise<Course> {
  const response = await fetch(`${API_BASE_URL}/admin/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: {
    success: boolean;
    message: string;
    data: {
      course: Course;
    };
  } = await response.json();

  return result.data.course;
}

export async function updateAdminCourse(
  courseId: number,
  payload: CourseFormPayload,
  token: string,
): Promise<Course> {
  const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: {
    success: boolean;
    message: string;
    data: {
      course: Course;
    };
  } = await response.json();

  return result.data.course;
}

export async function deleteAdminCourse(courseId: number, token: string) {
  const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function createTopicForCourse(
  courseId: number,
  payload: TopicFormPayload,
  token: string,
): Promise<Topic> {
  const response = await fetch(
    `${API_BASE_URL}/admin/courses/${courseId}/topics`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: {
    success: boolean;
    message: string;
    data: {
      topic: Topic;
    };
  } = await response.json();

  return result.data.topic;
}

export async function addLessonToCourse(
  courseId: number,
  payload: LessonFormPayload,
  token: string,
): Promise<Lesson> {
  const response = await fetch(
    `${API_BASE_URL}/admin/courses/${courseId}/lessons`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: {
    success: boolean;
    message: string;
    data: {
      lesson: Lesson;
    };
  } = await response.json();

  return result.data.lesson;
}

export async function updateLessonInCourse(
  lessonId: number,
  payload: LessonFormPayload,
  token: string,
): Promise<Lesson> {
  const response = await fetch(`${API_BASE_URL}/admin/lessons/${lessonId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: {
    success: boolean;
    message: string;
    data: {
      lesson: Lesson;
    };
  } = await response.json();

  return result.data.lesson;
}

export async function deleteLessonFromCourse(lessonId: number, token: string) {
  const response = await fetch(`${API_BASE_URL}/admin/lessons/${lessonId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}