export type Lesson = {
  id: number;
  title: string;
  duration: string;
  description: string;
};

export type Course = {
  id: number;
  shortName: string;
  title: string;
  description: string;
  level: string;
  instructor: string;
  lessons: Lesson[];
};

export const courses: Course[] = [
  {
    id: 1,
    shortName: "JS",
    title: "JavaScript Fundamentals",
    description:
      "Learn variables, functions, arrays, objects and modern JavaScript fundamentals.",
    level: "Beginner",
    instructor: "LearnTrack Team",
    lessons: [
      {
        id: 1,
        title: "Introduction to JavaScript",
        duration: "8 minutes",
        description:
          "Understand what JavaScript is and how it is used in web development.",
      },
      {
        id: 2,
        title: "Variables and Data Types",
        duration: "12 minutes",
        description:
          "Learn about strings, numbers, booleans, let and const.",
      },
      {
        id: 3,
        title: "Functions",
        duration: "15 minutes",
        description:
          "Learn how to create reusable blocks of JavaScript logic.",
      },
      {
        id: 4,
        title: "Arrays and Objects",
        duration: "18 minutes",
        description:
          "Store and organize multiple pieces of related information.",
      },
      {
        id: 5,
        title: "Array Methods",
        duration: "16 minutes",
        description:
          "Use methods such as map, filter and find with arrays.",
      },
    ],
  },
  {
    id: 2,
    shortName: "RE",
    title: "React Basics",
    description:
      "Learn components, props, state and the fundamentals of React applications.",
    level: "Beginner",
    instructor: "LearnTrack Team",
    lessons: [
      {
        id: 1,
        title: "Introduction to React",
        duration: "10 minutes",
        description:
          "Understand React and why developers use component-based interfaces.",
      },
      {
        id: 2,
        title: "Creating Components",
        duration: "15 minutes",
        description:
          "Create and reuse functional React components.",
      },
      {
        id: 3,
        title: "Understanding Props",
        duration: "14 minutes",
        description:
          "Pass information from a parent component to a child component.",
      },
      {
        id: 4,
        title: "React State",
        duration: "18 minutes",
        description:
          "Store and update changing information inside a component.",
      },
      {
        id: 5,
        title: "Rendering Lists",
        duration: "16 minutes",
        description:
          "Display collections of data using map and unique keys.",
      },
      {
        id: 6,
        title: "Handling Events",
        duration: "14 minutes",
        description:
          "Respond to button clicks and user interactions.",
      },
    ],
  },
  {
    id: 3,
    shortName: "DB",
    title: "Database Basics",
    description:
      "Understand databases, tables, records, relationships and basic SQL.",
    level: "Beginner",
    instructor: "LearnTrack Team",
    lessons: [
      {
        id: 1,
        title: "What is a Database?",
        duration: "9 minutes",
        description:
          "Understand why applications use databases to store information.",
      },
      {
        id: 2,
        title: "Tables, Rows and Columns",
        duration: "12 minutes",
        description:
          "Learn how relational databases organize their data.",
      },
      {
        id: 3,
        title: "Primary and Foreign Keys",
        duration: "15 minutes",
        description:
          "Understand identifiers and relationships between tables.",
      },
      {
        id: 4,
        title: "Introduction to SQL",
        duration: "17 minutes",
        description:
          "Learn the purpose of SQL and basic database operations.",
      },
      {
        id: 5,
        title: "CRUD Operations",
        duration: "20 minutes",
        description:
          "Understand Create, Read, Update and Delete operations.",
      },
    ],
  },
  {
    id: 4,
    shortName: "TS",
    title: "TypeScript Basics",
    description:
      "Learn types, interfaces and TypeScript fundamentals for safer code.",
    level: "Beginner",
    instructor: "LearnTrack Team",
    lessons: [
      {
        id: 1,
        title: "Why TypeScript?",
        duration: "8 minutes",
        description:
          "Understand how TypeScript improves JavaScript development.",
      },
      {
        id: 2,
        title: "Basic Types",
        duration: "14 minutes",
        description:
          "Use string, number, boolean, array and object types.",
      },
      {
        id: 3,
        title: "Type Aliases",
        duration: "12 minutes",
        description:
          "Create reusable custom types for application data.",
      },
      {
        id: 4,
        title: "Interfaces",
        duration: "16 minutes",
        description:
          "Describe the required structure of an object.",
      },
      {
        id: 5,
        title: "Typing Functions",
        duration: "15 minutes",
        description:
          "Add types to function parameters and returned values.",
      },
    ],
  },
];