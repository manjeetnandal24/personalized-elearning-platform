export type Lesson = {
  id: number;
  title: string;
  description: string;
  content: string;
  duration: string;
  position: number;
  courseId: number;
  topicId?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Topic = {
  id: number;
  title: string;
  description: string;
  position: number;
  courseId: number;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
};

export type Course = {
  id: number;
  title: string;
  description: string;
  shortName: string;
  level: string;
  category: string;
  instructor: string;
  lessons: Lesson[];
  topics: Topic[];
  createdAt: string;
  updatedAt: string;
};