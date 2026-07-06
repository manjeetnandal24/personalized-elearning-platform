const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export type CourseResourceType = "LINK" | "PDF" | "VIDEO" | "NOTE" | "OTHER";

export type CourseResourceCreator = {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
};

export type CourseResource = {
  id: number;
  title: string;
  description: string;
  resourceUrl: string;
  type: CourseResourceType;
  courseId: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  createdBy: CourseResourceCreator;
};

export type CourseWithResources = {
  id: number;
  shortName: string;
  title: string;
  description: string;
  level: string;
  category: string;
  instructor: string;
  instructorId: number | null;
  resources: CourseResource[];
};

export type CourseResourcePayload = {
  courseId: number;
  title: string;
  description: string;
  resourceUrl: string;
  type: CourseResourceType;
};

export async function fetchCourseResources(
  token: string,
): Promise<CourseWithResources[]> {
  const response = await fetch(`${API_BASE_URL}/course-resources`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load course resources.");
  }

  return data.data.courses;
}

export async function createCourseResource(
  token: string,
  payload: CourseResourcePayload,
): Promise<CourseResource> {
  const response = await fetch(`${API_BASE_URL}/course-resources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to create resource.");
  }

  return data.data.resource;
}

export async function updateCourseResource(
  token: string,
  resourceId: number,
  payload: CourseResourcePayload,
): Promise<CourseResource> {
  const response = await fetch(`${API_BASE_URL}/course-resources/${resourceId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update resource.");
  }

  return data.data.resource;
}

export async function deleteCourseResource(token: string, resourceId: number) {
  const response = await fetch(`${API_BASE_URL}/course-resources/${resourceId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete resource.");
  }

  return data;
}