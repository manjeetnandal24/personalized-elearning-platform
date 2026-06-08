type HeroProps = {
  studentName: string;
  onPersonalise: () => void;
};

function Hero({ studentName, onPersonalise }: HeroProps) {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <p className="small-heading">PERSONALISED LEARNING</p>

        <h1>Welcome, {studentName}</h1>

        <p className="hero-description">
          Explore beginner-friendly courses, complete lessons and monitor your
          learning journey in one place.
        </p>

        <button className="primary-button" onClick={onPersonalise}>
          Personalise My Dashboard
        </button>
      </div>
    </section>
  );
}

export default Hero;