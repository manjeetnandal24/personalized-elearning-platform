import type { Course } from "../types/course";

const API_BASE_URL = "http://localhost:5000/api";

type CoursesResponse = {
  success: boolean;
  data: {
    courses: Course[];
  };
};

type CourseResponse = {
  success: boolean;
  data: {
    course: Course;
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

export async function fetchCourses(): Promise<Course[]> {
  const response = await fetch(`${API_BASE_URL}/courses`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: CoursesResponse = await response.json();

  return result.data.courses;
}

export async function fetchCourseById(courseId: string): Promise<Course> {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: CourseResponse = await response.json();

  return result.data.course;
}