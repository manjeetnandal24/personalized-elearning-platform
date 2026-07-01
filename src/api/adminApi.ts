import type { Course, Lesson } from "../types/course";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export type CourseFormPayload = {
  title: string;
  description: string;
  shortName: string;
  level: string;
  category: string;
  instructor: string;
};

export type TopicFormPayload = {
  title: string;
  description: string;
};

export type LessonFormPayload = {
  title: string;
  description: string;
  content: string;
  duration: string;
  topicId: number | null;
};

function getAuthHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchAdminCourses(token: string): Promise<Course[]> {
  const response = await fetch(`${API_BASE_URL}/admin/courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load admin courses.");
  }

  return data.data.courses;
}

export async function createAdminCourse(
  payload: CourseFormPayload,
  token: string,
): Promise<Course> {
  const response = await fetch(`${API_BASE_URL}/admin/courses`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to create course.");
  }

  return data.data.course;
}

export async function updateAdminCourse(
  courseId: number,
  payload: CourseFormPayload,
  token: string,
): Promise<Course> {
  const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update course.");
  }

  return data.data.course;
}

export async function deleteAdminCourse(
  courseId: number,
  token: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete course.");
  }
}

export async function createTopicForCourse(
  courseId: number,
  payload: TopicFormPayload,
  token: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}/topics`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to create topic.");
  }
}

export async function addLessonToCourse(
  courseId: number,
  payload: LessonFormPayload,
  token: string,
): Promise<Lesson> {
  const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}/lessons`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to add lesson.");
  }

  return data.data.lesson;
}

export async function updateLessonInCourse(
  lessonId: number,
  payload: LessonFormPayload,
  token: string,
): Promise<Lesson> {
  const response = await fetch(`${API_BASE_URL}/admin/lessons/${lessonId}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update lesson.");
  }

  return data.data.lesson;
}

export async function deleteLessonFromCourse(
  lessonId: number,
  token: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/lessons/${lessonId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete lesson.");
  }
}