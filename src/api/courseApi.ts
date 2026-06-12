import type { Course } from "../types/course";

const API_BASE_URL = "http://localhost:5000/api";

type CoursesResponse = {
  success: boolean;
  count: number;
  data: Course[];
};

type CourseResponse = {
  success: boolean;
  data: Course;
};

export async function fetchCourses() {
  const response = await fetch(`${API_BASE_URL}/courses`);

  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }

  const result: CoursesResponse = await response.json();

  return result.data;
}

export async function fetchCourseById(courseId: string) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch course details");
  }

  const result: CourseResponse = await response.json();

  return result.data;
}