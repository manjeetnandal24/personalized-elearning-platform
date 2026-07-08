import { Route, Routes } from "react-router-dom";

import "./App.css";

import AdminRoute from "./components/AdminRoute";
import AiAssistant from "./components/AiAssistant";
import Footer from "./components/Footer";
import InstructorRoute from "./components/InstructorRoute";
import Navbar from "./components/Navbar";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import StudentRoute from "./components/StudentRoute";

import AdminActivityLogsPage from "./pages/AdminActivityLogsPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminCertificatesPage from "./pages/AdminCertificatesPage";
import AdminCoursesPage from "./pages/AdminCoursesPage";
import AdminCurriculumPage from "./pages/AdminCurriculumPage";
import AdminInstructorsPage from "./pages/AdminInstructorsPage";
import AdminLibraryPage from "./pages/AdminLibraryPage";
import AdminPage from "./pages/AdminPage";
import AdminQuizzesPage from "./pages/AdminQuizzesPage";
import AdminStudentsPage from "./pages/AdminStudentsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import CourseDiscussionsPage from "./pages/CourseDiscussionsPage";
import CourseResourcesPage from "./pages/CourseResourcesPage";
import CoursesPage from "./pages/CoursesPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import InstructorAnalyticsPage from "./pages/InstructorAnalyticsPage";
import InstructorCoursesPage from "./pages/InstructorCoursesPage";
import InstructorCurriculumPage from "./pages/InstructorCurriculumPage";
import InstructorPage from "./pages/InstructorPage";
import InstructorQuizzesPage from "./pages/InstructorQuizzesPage";
import InstructorStudentsPage from "./pages/InstructorStudentsPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import StudentCertificatePage from "./pages/StudentCertificatePage";
import StudentCertificatesPage from "./pages/StudentCertificatesPage";
import StudentCoursesPage from "./pages/StudentCoursesPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import StudentQuizResultsPage from "./pages/StudentQuizResultsPage";
import SupportPage from "./pages/SupportPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<StudentRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/courses" element={<StudentCoursesPage />} />
            <Route path="/dashboard/quizzes" element={<StudentQuizResultsPage />} />
            <Route path="/dashboard/certificates" element={<StudentCertificatesPage />} />
            <Route path="/dashboard/profile" element={<StudentProfilePage />} />
            <Route path="/certificates/courses/:courseId" element={<StudentCertificatePage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/students" element={<AdminStudentsPage />} />
            <Route path="/admin/instructors" element={<AdminInstructorsPage />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/curriculum" element={<AdminCurriculumPage />} />
            <Route path="/admin/quizzes" element={<AdminQuizzesPage />} />
            <Route path="/admin/certificates" element={<AdminCertificatesPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/activity-logs" element={<AdminActivityLogsPage />} />
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
          <Route path="/discussions" element={<CourseDiscussionsPage />} />
          <Route path="/support" element={<SupportPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
      <AiAssistant />
    </div>
  );
}

export default App;