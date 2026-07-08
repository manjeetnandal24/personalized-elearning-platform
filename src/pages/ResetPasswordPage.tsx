import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";

import { resetPassword } from "../api/authApi";

function ResetPasswordPage() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!token) {
      setErrorMessage("Password reset token is missing.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await resetPassword(token, password);

      setSuccessMessage(result.message);
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to reset password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="form-page">
      <div className="email-verification-card">
        <div className="email-verification-icon">🔐</div>

        <p className="small-heading">PASSWORD RESET</p>

        <h1>Set New Password</h1>

        <p>Create a new password for your LearnTrack account.</p>

        {errorMessage && (
          <div className="form-message error-message">{errorMessage}</div>
        )}

        {successMessage && (
          <div className="verification-status-box success">
            <h2>Password changed successfully 🎉</h2>
            <p>You can now login using your new password.</p>

            <Link to="/login" className="primary-button form-button">
              Go to Login
            </Link>
          </div>
        )}

        {!successMessage && (
          <form className="reset-password-form" onSubmit={handleSubmit}>
            <label htmlFor="new-password">New Password</label>

            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />

            <label htmlFor="confirm-new-password">Confirm Password</label>

            <input
              id="confirm-new-password"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
              />

              <span>Show passwords</span>
            </label>

            <button
              type="submit"
              className="primary-button form-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting password..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default ResetPasswordPage;