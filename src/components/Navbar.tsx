function Navbar() {
  return (
    <header className="navbar">
      <h2 className="logo">LearnTrack</h2>

      <nav>
        <a href="#home">Home</a>
        <a href="#courses">Courses</a>
        <a href="#progress">Progress</a>
      </nav>

      <button className="login-button">Login</button>
    </header>
  );
}

export default Navbar;
