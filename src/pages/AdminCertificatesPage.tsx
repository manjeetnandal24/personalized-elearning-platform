import { useEffect, useState, type FormEvent } from "react";

import { fetchAdminCourses } from "../api/adminApi";
import {
  fetchAdminCertificateTemplate,
  saveAdminCertificateTemplate,
  type CertificateTemplateForm,
} from "../api/certificateApi";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types/course";

const defaultTemplateForm: CertificateTemplateForm = {
  title: "Certificate of Completion",
  subtitle: "This certificate is proudly presented to",
  bodyText: "for successfully completing the course",
  footerText: "Keep learning and growing with LearnTrack.",
  signatoryName: "Course Instructor",
  signatoryTitle: "Instructor",
  brandColor: "#2563eb",
  isActive: true,
};

function AdminCertificatesPage() {
  const { token } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [templateForm, setTemplateForm] =
    useState<CertificateTemplateForm>(defaultTemplateForm);

  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedCourse = courses.find(
    (course) => course.id === Number(selectedCourseId),
  );

  useEffect(() => {
    async function loadCourses() {
      if (!token) {
        setIsLoadingCourses(false);
        return;
      }

      try {
        const data = await fetchAdminCourses(token);
        setCourses(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load courses.",
        );
      } finally {
        setIsLoadingCourses(false);
      }
    }

    loadCourses();
  }, [token]);

  useEffect(() => {
    async function loadTemplate() {
      if (!token || !selectedCourseId) {
        setTemplateForm(defaultTemplateForm);
        return;
      }

      try {
        setIsLoadingTemplate(true);
        setMessage("");
        setErrorMessage("");

        const data = await fetchAdminCertificateTemplate(
          Number(selectedCourseId),
          token,
        );

        if (data.template) {
          setTemplateForm({
            title: data.template.title,
            subtitle: data.template.subtitle,
            bodyText: data.template.bodyText,
            footerText: data.template.footerText,
            signatoryName: data.template.signatoryName,
            signatoryTitle: data.template.signatoryTitle,
            brandColor: data.template.brandColor,
            isActive: data.template.isActive,
          });
        } else {
          setTemplateForm(defaultTemplateForm);
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load certificate template.",
        );
      } finally {
        setIsLoadingTemplate(false);
      }
    }

    loadTemplate();
  }, [selectedCourseId, token]);

  async function handleSaveTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !selectedCourseId) {
      setErrorMessage("Please select a course first.");
      return;
    }

    try {
      setIsSaving(true);
      setMessage("");
      setErrorMessage("");

      await saveAdminCertificateTemplate(
        Number(selectedCourseId),
        templateForm,
        token,
      );

      setMessage("Certificate format saved successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save certificate format.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-hero-card">
        <div>
          <p className="small-heading">CERTIFICATE FORMAT</p>
          <h1>Certificate Builder</h1>
          <p>
            Design landscape e-certificates with digital signature style for each
            course.
          </p>
        </div>
      </div>

      {message && <p className="status-text">{message}</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}
      {isLoadingCourses && <p className="status-text">Loading courses...</p>}

      <div className="admin-grid certificate-builder-grid">
        <form className="auth-form admin-form" onSubmit={handleSaveTemplate}>
          <div className="form-heading">
            <p className="small-heading">DESIGN</p>
            <h2>Certificate Format</h2>
          </div>

          <label>
            Select Course
            <select
              value={selectedCourseId}
              onChange={(event) => setSelectedCourseId(event.target.value)}
            >
              <option value="">Choose a course</option>

              {courses.map((course) => (
                <option value={course.id} key={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>

          {isLoadingTemplate && (
            <p className="status-text left-status-text">
              Loading certificate format...
            </p>
          )}

          <label>
            Certificate Title
            <input
              type="text"
              value={templateForm.title}
              onChange={(event) =>
                setTemplateForm({
                  ...templateForm,
                  title: event.target.value,
                })
              }
              placeholder="Certificate of Completion"
            />
          </label>

          <label>
            Subtitle
            <input
              type="text"
              value={templateForm.subtitle}
              onChange={(event) =>
                setTemplateForm({
                  ...templateForm,
                  subtitle: event.target.value,
                })
              }
              placeholder="This certificate is proudly presented to"
            />
          </label>

          <label>
            Body Text
            <textarea
              value={templateForm.bodyText}
              onChange={(event) =>
                setTemplateForm({
                  ...templateForm,
                  bodyText: event.target.value,
                })
              }
              placeholder="for successfully completing the course"
            />
          </label>

          <label>
            Footer Text
            <textarea
              value={templateForm.footerText}
              onChange={(event) =>
                setTemplateForm({
                  ...templateForm,
                  footerText: event.target.value,
                })
              }
              placeholder="Keep learning and growing with LearnTrack."
            />
          </label>

          <label>
            Digital Signature Name
            <input
              type="text"
              value={templateForm.signatoryName}
              onChange={(event) =>
                setTemplateForm({
                  ...templateForm,
                  signatoryName: event.target.value,
                })
              }
              placeholder="Example: Dr. Sharma"
            />
          </label>

          <label>
            Signatory Title
            <input
              type="text"
              value={templateForm.signatoryTitle}
              onChange={(event) =>
                setTemplateForm({
                  ...templateForm,
                  signatoryTitle: event.target.value,
                })
              }
              placeholder="Instructor / Head of Department"
            />
          </label>

          <label>
            Certificate Theme Color
            <input
              type="color"
              value={templateForm.brandColor}
              onChange={(event) =>
                setTemplateForm({
                  ...templateForm,
                  brandColor: event.target.value,
                })
              }
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={templateForm.isActive}
              onChange={(event) =>
                setTemplateForm({
                  ...templateForm,
                  isActive: event.target.checked,
                })
              }
            />
            Active certificate format
          </label>

          <button
            type="submit"
            className="primary-button"
            disabled={!selectedCourseId || isSaving}
          >
            {isSaving ? "Saving..." : "Save Certificate Format"}
          </button>
        </form>

        <div className="certificate-preview-panel">
          <div className="lessons-heading">
            <h2>Landscape Preview</h2>
            <p>Real e-certificate style with digital signature.</p>
          </div>

          <div className="certificate-landscape-wrapper">
            <div
              className="certificate-preview-card landscape-certificate"
              style={{ borderColor: templateForm.brandColor }}
            >
              <div
                className="certificate-corner certificate-corner-left"
                style={{ borderColor: templateForm.brandColor }}
              />

              <div
                className="certificate-corner certificate-corner-right"
                style={{ borderColor: templateForm.brandColor }}
              />

              <div
                className="certificate-preview-ribbon"
                style={{ backgroundColor: templateForm.brandColor }}
              />

              <p
                className="certificate-preview-brand"
                style={{ color: templateForm.brandColor }}
              >
                LearnTrack E-Certificate
              </p>

              <h2>{templateForm.title}</h2>

              <p className="certificate-preview-subtitle">
                {templateForm.subtitle}
              </p>

              <h1>Student Name</h1>

              <p className="certificate-preview-body">{templateForm.bodyText}</p>

              <h3>{selectedCourse?.title || "Selected Course Name"}</h3>

              <div className="certificate-preview-meta">
                <p>
                  <strong>Instructor:</strong>{" "}
                  {selectedCourse?.instructor || "Course Instructor"}
                </p>

                <p>
                  <strong>Certificate ID:</strong> LT-SAMPLE-0001
                </p>

                <p>
                  <strong>Issued Date:</strong> Auto Generated
                </p>
              </div>

              <p className="certificate-preview-footer">
                {templateForm.footerText}
              </p>

              <div className="certificate-bottom-row">
                <div className="certificate-verification-box">
                  <strong>Verified E-Certificate</strong>
                  <span>Auto generated by LearnTrack</span>
                </div>

                <div className="certificate-preview-signature">
                  <span className="digital-signature-text">
                    {templateForm.signatoryName}
                  </span>

                  <strong>{templateForm.signatoryName}</strong>
                  <span>{templateForm.signatoryTitle}</span>
                </div>
              </div>
            </div>
          </div>

          {!selectedCourseId && (
            <p className="status-text left-status-text">
              Select a course to save this certificate format.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminCertificatesPage;