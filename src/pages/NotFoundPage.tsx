import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="not-found-page">
      <h1>404</h1>
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist.</p>

      <Link to="/" className="primary-link">
        Return Home
      </Link>
    </section>
  );
}

export default NotFoundPage;
