import { useState } from "react";
import "./App.css";

type Course = {
  id: number;
  shortName: string;
  title: string;
  description: string;
  level: string;
};

const courses: Course[] = [
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

function App() {
  const [studentName, setStudentName] = useState("Student");

  return (
    <div className="app">
      <header className="navbar">
        <h2 className="logo">LearnTrack</h2>

        <nav>
          <a href="#home">Home</a>
          <a href="#courses">Courses</a>
          <a href="#progress">Progress</a>
        </nav>

        <button className="login-button">Login</button>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="small-heading">PERSONALISED LEARNING</p>

            <h1>Welcome, {studentName}</h1>

            <p className="hero-description">
              Explore beginner-friendly courses, complete lessons and monitor
              your learning journey in one place.
            </p>

               <button
                 className="primary-button"
                 onClick={() => setStudentName("Manjeet")}
>
                Personalise My Dashboard
                </button>
          </div>
        </section>

        <section className="courses-section" id="courses">
          <div className="section-heading">
            <h2>Popular Courses</h2>
            <p>Start learning with our beginner-friendly courses.</p>
          </div>

          <div className="course-container">
            {courses.map((course) => (
              <div className="course-card" key={course.id}>
                <div className="course-icon">{course.shortName}</div>

                <h3>{course.title}</h3>

                <p>{course.description}</p>

                <span>{course.level}</span>

                <button>View Course</button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <p>© 2026 LearnTrack. Personalised E-Learning Platform.</p>
      </footer>
    </div>
  );
}

export default App;