import { Route, Routes } from "react-router-dom";

import "./App.css";

import AdminRoute from "./components/AdminRoute";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import StudentRoute from "./components/StudentRoute";

import AdminCoursesPage from "./pages/AdminCoursesPage";
import AdminCurriculumPage from "./pages/AdminCurriculumPage";
import AdminLibraryPage from "./pages/AdminLibraryPage";
import AdminPage from "./pages/AdminPage";
import AdminQuizzesPage from "./pages/AdminQuizzesPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import CoursesPage from "./pages/CoursesPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import StudentCoursesPage from "./pages/StudentCoursesPage";
import StudentQuizResultsPage from "./pages/StudentQuizResultsPage";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailsPage />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<StudentRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/courses" element={<StudentCoursesPage />} />
            <Route
              path="/dashboard/quizzes"
              element={<StudentQuizResultsPage />}
            />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route
              path="/admin/curriculum"
              element={<AdminCurriculumPage />}
            />
            <Route path="/admin/quizzes" element={<AdminQuizzesPage />} />
            <Route path="/admin/library" element={<AdminLibraryPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;