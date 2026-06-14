import { Link } from "react-router-dom";

type HeroProps = {
  userName?: string;
  isAuthenticated: boolean;
};

function Hero({ userName, isAuthenticated }: HeroProps) {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <p className="small-heading">PERSONALISED LEARNING</p>

        <h1>
          {isAuthenticated && userName
            ? `Welcome back, ${userName}`
            : "Learn new skills and track your progress"}
        </h1>

        <p className="hero-description">
          Explore beginner-friendly courses, complete lessons and monitor your
          learning journey in one place.
        </p>

        {isAuthenticated ? (
          <Link to="/dashboard" className="primary-link hero-link">
            Go to Dashboard
          </Link>
        ) : (
          <Link to="/courses" className="primary-link hero-link">
            Explore Courses
          </Link>
        )}
      </div>
    </section>
  );
}

export default Hero;