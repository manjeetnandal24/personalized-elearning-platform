import Hero from "../components/Hero";
import CoursesSection from "../components/CoursesSection";
import ProgressSection from "../components/ProgressSection";

type HomePageProps = {
  studentName: string;
  onPersonalise: () => void;
};

function HomePage({ studentName, onPersonalise }: HomePageProps) {
  return (
    <>
      <Hero
        studentName={studentName}
        onPersonalise={onPersonalise}
      />

      <CoursesSection />

      <ProgressSection />
    </>
  );
}

export default HomePage;
