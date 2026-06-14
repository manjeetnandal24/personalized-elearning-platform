import CoursesSection from "../components/CoursesSection";
import Hero from "../components/Hero";
import ProgressSection from "../components/ProgressSection";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      <Hero userName={user?.name} isAuthenticated={isAuthenticated} />

      <CoursesSection />

      <ProgressSection />
    </>
  );
}

export default HomePage;