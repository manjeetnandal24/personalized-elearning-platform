export type Lesson = {
  id: number;
  title: string;
  description: string;
  duration: string;
  position: number;
  courseId: number;
  createdAt: string;
  updatedAt: string;
};

export type Course = {
  id: number;
  shortName: string;
  title: string;
  description: string;
  level: string;
  instructor: string;
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
};