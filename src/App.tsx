import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";


function App() {
  const [studentName, setStudentName] = useState("Student");

  return (
    <div className="app">
      <Navbar />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                studentName={studentName}
                onPersonalise={() => setStudentName("Manjeet")}
              />
            }
          />

          <Route path="/courses" element={<CoursesPage />} />

          <Route path="/courses/:courseId" element={<CourseDetailsPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />

          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
