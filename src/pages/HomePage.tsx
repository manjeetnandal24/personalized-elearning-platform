import AdminHomeSection from "../components/AdminHomeSection";
import CoursesSection from "../components/CoursesSection";
import Hero from "../components/Hero";
import ProgressSection from "../components/ProgressSection";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const { user, isAuthenticated } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      <Hero userName={user?.name} isAuthenticated={isAuthenticated} />

      {isAdmin ? (
        <AdminHomeSection />
      ) : (
        <>
          <CoursesSection />

          <ProgressSection />
        </>
      )}
    </>
  );
}

export default HomePage;