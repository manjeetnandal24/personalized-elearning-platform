function DashboardPage() {
  return (
    <section className="dashboard-page">
      <div className="dashboard-heading">
        <p className="small-heading">STUDENT DASHBOARD</p>
        <h1>Welcome back, Manjeet</h1>
        <p>Continue learning and monitor your progress.</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <p>Enrolled Courses</p>
          <h2>4</h2>
        </div>

        <div className="dashboard-card">
          <p>Completed Lessons</p>
          <h2>6</h2>
        </div>

        <div className="dashboard-card">
          <p>Overall Progress</p>
          <h2>60%</h2>
        </div>
      </div>

      <div className="continue-card">
        <div>
          <p className="small-heading">CONTINUE LEARNING</p>
          <h2>React Basics</h2>
          <p>You have completed 6 out of 10 lessons.</p>
        </div>

        <button className="primary-button">Continue Course</button>
      </div>
    </section>
  );
}

export default DashboardPage;
