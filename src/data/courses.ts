export type Course = {
  id: number;
  shortName: string;
  title: string;
  description: string;
  level: string;
};

export const courses: Course[] = [
  {
    id: 1,
    shortName: "JS",
    title: "JavaScript Fundamentals",
    description: "Learn variables, functions, arrays and modern JavaScript.",
    level: "Beginner",
  },
  {
    id: 2,
    shortName: "RE",
    title: "React Basics",
    description: "Learn components, props, state and React application basics.",
    level: "Beginner",
  },
  {
    id: 3,
    shortName: "DB",
    title: "Database Basics",
    description: "Understand databases, tables, records and basic SQL.",
    level: "Beginner",
  },
  {
    id: 4,
    shortName: "TS",
    title: "TypeScript Basics",
    description: "Learn types, interfaces and TypeScript fundamentals.",
    level: "Beginner",
  },
];
