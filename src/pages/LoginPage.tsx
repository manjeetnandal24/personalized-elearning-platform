import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { loginUser, resendVerificationEmail } from "../api/authApi";
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
  const [successMessage, setSuccessMessage] = useState("");
  const [verificationLink, setVerificationLink] = useState("");
  const [canResendVerification, setCanResendVerification] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setVerificationLink("");
    setCanResendVerification(false);

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

      const fallbackPath =
        authData.user.role === "ADMIN"
          ? "/admin"
          : authData.user.role === "INSTRUCTOR"
            ? "/instructor"
            : "/dashboard";

      navigate(requestedPath || fallbackPath, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";

      setErrorMessage(message);

      if (message.toLowerCase().includes("verify your email")) {
        setCanResendVerification(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendVerification() {
    const cleanEmail = email.trim().toLowerCase();

    setErrorMessage("");
    setSuccessMessage("");
    setVerificationLink("");

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Please enter your registered email first.");
      return;
    }

    try {
      setIsResending(true);

      const result = await resendVerificationEmail(cleanEmail);

      setSuccessMessage("Verification link generated successfully.");
      setVerificationLink(result.data.verificationLink);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to resend verification link.",
      );
    } finally {
      setIsResending(false);
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

        {successMessage && (
          <div className="form-message success-message">{successMessage}</div>
        )}

        {canResendVerification && (
          <div className="form-message success-message">
            <p>Your email is not verified yet.</p>

            <button
              type="button"
              className="secondary-button"
              onClick={handleResendVerification}
              disabled={isResending}
            >
              {isResending ? "Generating link..." : "Resend Verification Link"}
            </button>
          </div>
        )}

             {verificationLink && (
                <div className="verification-panel">
            <p>Demo verification link:</p>

            <a href={verificationLink} target="_blank" rel="noreferrer">
              Verify Email
            </a>

            <input
              type="text"
              value={verificationLink}
              readOnly
              onFocus={(event) => event.target.select()}
            />
          </div>
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