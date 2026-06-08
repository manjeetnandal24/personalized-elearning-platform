import { useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CoursesSection from "./components/CoursesSection";
import Footer from "./components/Footer";
import ProgressSection from "./components/ProgressSection";


function App() {
  const [studentName, setStudentName] = useState("Student");

  return (
    <div className="app">
      <Navbar />

      <main>
        <Hero
          studentName={studentName}
          onPersonalise={() => setStudentName("Manjeet")}
        />

        <CoursesSection />
        <ProgressSection />
      </main>

      <Footer />
    </div>
  );
}

export default App;
