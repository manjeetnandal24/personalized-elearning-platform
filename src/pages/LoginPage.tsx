import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const requestedPath = (location.state as { from?: { pathname?: string } } | null)
  ?.from?.pathname;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must contain at least 8 characters.");
      return;
    }

    try {
      setIsSubmitting(true);

      const authData = await loginUser({
        email: cleanEmail,
        password,
      });

      login(authData);
      const fallbackPath = authData.user.role === "ADMIN" ? "/admin" : "/dashboard";
      navigate(requestedPath || fallbackPath);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Login failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="form-page">
      <div className="form-card">
        <h1>Welcome Back</h1>

        <p>Login to continue your learning journey.</p>

        {errorMessage && (
          <div className="form-message error-message">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email address</label>

          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="login-password">Password</label>

          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
            />

            <span>Show password</span>
          </label>

          <button
            type="submit"
            className="primary-button form-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="form-switch-text">
          Don&apos;t have an account? <Link to="/register">Create account</Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;