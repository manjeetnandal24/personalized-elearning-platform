import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "../api/authApi";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [resetLink, setResetLink] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setResetLink("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await forgotPassword(cleanEmail);

      setSuccessMessage(result.message);

      if (result.data.resetLink) {
        setResetLink(result.data.resetLink);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to generate reset link.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="form-page">
      <div className="form-card">
        <h1>Forgot Password</h1>

        <p>Enter your registered email to generate a password reset link.</p>

        {errorMessage && (
          <div className="form-message error-message">{errorMessage}</div>
        )}

        {successMessage && (
          <div className="form-message success-message">{successMessage}</div>
        )}

        {resetLink && (
          <div className="verification-panel password-reset-panel">
            <p>Demo reset link generated. Open this link to reset password:</p>

            <a href={resetLink} target="_blank" rel="noreferrer">
              Reset Password
            </a>

            <input
              type="text"
              value={resetLink}
              readOnly
              onFocus={(event) => event.target.select()}
            />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="forgot-email">Email address</label>

          <input
            id="forgot-email"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <button
            type="submit"
            className="primary-button form-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Generating link..." : "Generate Reset Link"}
          </button>
        </form>

        <p className="form-switch-text">
          Remember password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </section>
  );
}

export default ForgotPasswordPage;