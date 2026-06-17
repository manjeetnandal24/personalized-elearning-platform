export type Lesson = {
  id: number;
  title: string;
  description: string;
  content: string;
  duration: string;
  position: number;
  courseId: number;
  createdAt: string;
  updatedAt: string;
};

export type Course = {
  id: number;
  title: string;
  description: string;
  shortName: string;
  level: string;
  instructor: string;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
};