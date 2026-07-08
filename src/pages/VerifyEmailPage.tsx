import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { verifyEmail } from "../api/authApi";

function VerifyEmailPage() {
  const { token } = useParams();
  const hasVerified = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    async function handleVerifyEmail() {
      if (hasVerified.current) {
        return;
      }

      hasVerified.current = true;

      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const result = await verifyEmail(token);

        setStatus("success");
        setMessage(result.message || "Email verified successfully.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify email.",
        );
      }
    }

    void handleVerifyEmail();
  }, [token]);

  return (
    <section className="form-page">
      <div className="email-verification-card">
        <div
          className={`email-verification-icon ${
            status === "error" ? "error" : ""
          }`}
        >
          {status === "loading" ? "⏳" : status === "success" ? "✅" : "⚠️"}
        </div>

        <p className="small-heading">EMAIL VERIFICATION</p>

        <h1>
          {status === "loading"
            ? "Verifying Email"
            : status === "success"
              ? "Email Verified"
              : "Verification Failed"}
        </h1>

        <p>{message}</p>

        {status === "loading" && (
          <div className="verification-status-box">
            Please wait while we verify your account.
          </div>
        )}

        {status === "success" && (
          <div className="verification-status-box success">
            <h2>Your account is ready 🎉</h2>
            <p>You can now login and start using LearnTrack.</p>

            <Link to="/login" className="primary-button form-button">
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="verification-status-box error">
            <h2>Link invalid or expired</h2>
            <p>
              This link may already be used. Try logging in, or resend a new
              verification link from the login page.
            </p>

            <Link to="/login" className="secondary-button form-button">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default VerifyEmailPage;