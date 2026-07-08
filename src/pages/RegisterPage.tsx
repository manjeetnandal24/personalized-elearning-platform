import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { registerUser } from "../api/authApi";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [verificationLink, setVerificationLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setVerificationLink("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setErrorMessage("Name must contain at least 2 characters.");
      return;
    }

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
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

      const registerData = await registerUser({
        name: cleanName,
        email: cleanEmail,
        password,
      });

      setSuccessMessage(
        "Account created successfully. Please verify your email before login.",
      );

      setVerificationLink(registerData.verificationLink);

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Registration failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="form-page">
      <div className="form-card register-card">
        <h1>Create Account</h1>

        <p>Register to start learning and tracking your progress.</p>

        {errorMessage && (
          <div className="form-message error-message">{errorMessage}</div>
        )}

        {successMessage && (
          <div className="form-message success-message">{successMessage}</div>
        )}

             {verificationLink && (
               <div className="verification-panel">
            <p>
              Demo verification link generated. Open this link to verify your
              account:
            </p>

            <a href={verificationLink} target="_blank" rel="noreferrer">
              Verify Email
            </a>

            <input
              type="text"
              value={verificationLink}
              readOnly
              onFocus={(event) => event.target.select()}
            />

            <p>
              After verification, go to <Link to="/login">Login</Link>.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full name</label>

          <input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
          />

          <label htmlFor="register-email">Email address</label>

          <input
            id="register-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="register-password">Password</label>

          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter at least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
          />

          <label htmlFor="confirm-password">Confirm password</label>

          <input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password again"
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
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="form-switch-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;