import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

type HeroProps = {
  userName?: string;
  isAuthenticated: boolean;
};

function Hero({ userName, isAuthenticated }: HeroProps) {
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <p className="small-heading">
          {isAdmin ? "ADMIN CONTROL CENTER" : "PERSONALISED LEARNING"}
        </p>

        <h1>
          {isAdmin && userName
            ? `Welcome Admin, ${userName}`
            : isAuthenticated && userName
              ? `Welcome back, ${userName}`
              : "Learn new skills and track your progress"}
        </h1>

        <p className="hero-description">
          {isAdmin
            ? "Manage courses, add lessons and keep the learning platform updated."
            : "Explore beginner-friendly courses, complete lessons and monitor your learning journey in one place."}
        </p>

        {isAdmin ? (
          <Link to="/admin" className="primary-link hero-link">
            Manage Courses
          </Link>
        ) : isAuthenticated ? (
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