import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  fetchStudentCertificateStatus,
  type StudentCertificateStatus,
} from "../api/certificateApi";
import { useAuth } from "../context/AuthContext";

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function StudentCertificatePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { token } = useAuth();

  const [certificateStatus, setCertificateStatus] =
    useState<StudentCertificateStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCertificate() {
      if (!token) {
        setErrorMessage("Login token is missing.");
        setIsLoading(false);
        return;
      }

      if (!courseId) {
        setErrorMessage("Invalid course ID.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchStudentCertificateStatus(Number(courseId), token);
        setCertificateStatus(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load certificate.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadCertificate();
  }, [courseId, token]);

  if (isLoading) {
    return (
      <section className="dashboard-page">
        <p className="status-text">Loading certificate...</p>
      </section>
    );
  }

  if (errorMessage || !certificateStatus) {
    return (
      <section className="dashboard-page">
        <div className="empty-dashboard-card">
          <h2>Certificate unavailable</h2>
          <p>{errorMessage || "Unable to load certificate details."}</p>

          <Link to="/dashboard/certificates" className="course-link">
            Back to Certificates
          </Link>
        </div>
      </section>
    );
  }

  const template = certificateStatus.template;
  const certificate = certificateStatus.certificate;

  return (
    <section className="dashboard-page certificate-view-page">
      <div className="dashboard-heading certificate-screen-only">
        <p className="small-heading">COURSE CERTIFICATE</p>
        <h1>{certificateStatus.course.title}</h1>
        <p>
          Complete all requirements to unlock your auto-generated LearnTrack
          certificate.
        </p>
      </div>

      <div className="certificate-actions-row certificate-screen-only">
        <Link to="/dashboard/certificates" className="secondary-button">
          Back
        </Link>

        {certificateStatus.isEligible && certificate && (
          <button
            type="button"
            className="primary-button"
            onClick={() => window.print()}
          >
            Print / Download PDF
          </button>
        )}
      </div>

      <div className="certificate-requirements-card certificate-screen-only">
        <div>
          <p className="small-heading">ELIGIBILITY CHECKLIST</p>
          <h2>
            {certificateStatus.isEligible
              ? "Certificate Unlocked"
              : "Certificate Locked"}
          </h2>
          <p>
            Your certificate unlocks after completing lessons and passing course
            quizzes.
          </p>
        </div>

        <div className="certificate-checklist">
          <div
            className={
              certificateStatus.hasActiveTemplate
                ? "certificate-check-row completed-check-row"
                : "certificate-check-row"
            }
          >
            <span>{certificateStatus.hasActiveTemplate ? "✅" : "⏳"}</span>
            Certificate format active
          </div>

          <div
            className={
              certificateStatus.lessons.lessonsCompleted
                ? "certificate-check-row completed-check-row"
                : "certificate-check-row"
            }
          >
            <span>
              {certificateStatus.lessons.lessonsCompleted ? "✅" : "⏳"}
            </span>
            Lessons completed: {certificateStatus.lessons.completedLessons}/
            {certificateStatus.lessons.totalLessons}
          </div>

          <div
            className={
              certificateStatus.quizzes.quizzesCompleted
                ? "certificate-check-row completed-check-row"
                : "certificate-check-row"
            }
          >
            <span>
              {certificateStatus.quizzes.quizzesCompleted ? "✅" : "⏳"}
            </span>
            Quizzes passed: {certificateStatus.quizzes.passedQuizzes}/
            {certificateStatus.quizzes.totalQuizzes}
          </div>
        </div>
      </div>

      {!certificateStatus.isEligible && (
        <div className="empty-dashboard-card certificate-screen-only">
          <h2>Certificate is still locked</h2>
          <p>
            Finish all lessons and pass all quizzes in this course to unlock your
            certificate.
          </p>

          <Link
            to={`/courses/${certificateStatus.course.id}`}
            className="course-link dashboard-login-link"
          >
            Continue Course
          </Link>
        </div>
      )}

      {certificateStatus.isEligible && certificate && template && (
        <div className="certificate-landscape-wrapper">
          <div
            className="certificate-preview-card landscape-certificate student-final-certificate"
            style={{ borderColor: template.brandColor }}
          >
            <div
              className="certificate-corner certificate-corner-left"
              style={{ borderColor: template.brandColor }}
            />

            <div
              className="certificate-corner certificate-corner-right"
              style={{ borderColor: template.brandColor }}
            />

            <div
              className="certificate-preview-ribbon"
              style={{ backgroundColor: template.brandColor }}
            />

            <p
              className="certificate-preview-brand"
              style={{ color: template.brandColor }}
            >
              LearnTrack E-Certificate
            </p>

            <h2>{template.title}</h2>

            <p className="certificate-preview-subtitle">{template.subtitle}</p>

            <h1>{certificateStatus.student.name}</h1>

            <p className="certificate-preview-body">{template.bodyText}</p>

            <h3>{certificateStatus.course.title}</h3>

            <div className="certificate-preview-meta">
              <p>
                <strong>Instructor:</strong> {certificateStatus.course.instructor}
              </p>

              <p>
                <strong>Certificate ID:</strong> {certificate.certificateCode}
              </p>

              <p>
                <strong>Issued Date:</strong> {formatDate(certificate.issuedAt)}
              </p>
            </div>

            <p className="certificate-preview-footer">{template.footerText}</p>

            <div className="certificate-bottom-row">
              <div className="certificate-verification-box">
                <strong>Verified E-Certificate</strong>
                <span>Auto generated by LearnTrack</span>
              </div>

              <div className="certificate-preview-signature">
                <span className="digital-signature-text">
                  {template.signatoryName}
                </span>

                <strong>{template.signatoryName}</strong>
                <span>{template.signatoryTitle}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default StudentCertificatePage;