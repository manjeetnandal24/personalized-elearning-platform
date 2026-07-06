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
import AdminCertificatesPage from "./pages/AdminCertificatesPage";
import StudentCertificatePage from "./pages/StudentCertificatePage";
import StudentCertificatesPage from "./pages/StudentCertificatesPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import AdminStudentsPage from "./pages/AdminStudentsPage";
import AiAssistant from "./components/AiAssistant";
import InstructorRoute from "./components/InstructorRoute";
import InstructorPage from "./pages/InstructorPage";
import InstructorCoursesPage from "./pages/InstructorCoursesPage";
import InstructorCurriculumPage from "./pages/InstructorCurriculumPage";
import InstructorStudentsPage from "./pages/InstructorStudentsPage";
import InstructorQuizzesPage from "./pages/InstructorQuizzesPage";
import InstructorAnalyticsPage from "./pages/InstructorAnalyticsPage";
import AdminInstructorsPage from "./pages/AdminInstructorsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import CourseResourcesPage from "./pages/CourseResourcesPage";

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

<Route element={<InstructorRoute />}>
  <Route path="/instructor" element={<InstructorPage />} />
</Route>


          <Route element={<StudentRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/courses" element={<StudentCoursesPage />} />
            <Route
              path="/dashboard/quizzes"
              element={<StudentQuizResultsPage />}
            />
            <Route path="/dashboard/certificates" element={<StudentCertificatesPage />} />
            <Route path="/dashboard/profile" element={<StudentProfilePage />} />
            <Route path="/certificates/courses/:courseId" element={<StudentCertificatePage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/students" element={<AdminStudentsPage />} />
            <Route path="/admin/instructors" element={<AdminInstructorsPage />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route
              path="/admin/curriculum"
              element={<AdminCurriculumPage />}
            />
            <Route path="/admin/quizzes" element={<AdminQuizzesPage />} />
            <Route path="/admin/certificates" element={<AdminCertificatesPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/library" element={<AdminLibraryPage />} />
          </Route>

          <Route element={<InstructorRoute />}>
          <Route path="/instructor" element={<InstructorPage />} />
          <Route path="/instructor/courses" element={<InstructorCoursesPage />} />
          <Route path="/instructor/curriculum" element={<InstructorCurriculumPage />} />
          <Route path="/instructor/quizzes" element={<InstructorQuizzesPage />} />
          <Route path="/instructor/students" element={<InstructorStudentsPage />} />
          <Route path="/instructor/analytics" element={<InstructorAnalyticsPage />} />
          </Route>



          <Route path="/announcements" element={<AnnouncementsPage />} />

          <Route path="/resources" element={<CourseResourcesPage />} />

          



          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
      <AiAssistant />
    </div>
  );
}

export default App;