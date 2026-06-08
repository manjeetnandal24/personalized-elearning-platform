function ProgressSection() {
  const completedLessons = 6;
  const totalLessons = 10;
  const progressPercentage = (completedLessons / totalLessons) * 100;

  return (
    <section className="progress-section" id="progress">
      <div className="section-heading">
        <h2>Your Learning Progress</h2>
        <p>Track how much you have completed.</p>
      </div>

      <div className="progress-card">
        <h3>React Basics</h3>

        <p>
          Completed {completedLessons} out of {totalLessons} lessons
        </p>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <strong>{progressPercentage}% Completed</strong>
      </div>
    </section>
  );
}

export default ProgressSection;
