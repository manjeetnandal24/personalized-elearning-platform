import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";

import {
  createAnnouncement,
  deleteAnnouncement,
  fetchAnnouncements,
  updateAnnouncement,
  type Announcement,
  type AnnouncementPayload,
  type AnnouncementTarget,
} from "../api/announcementsApi";
import { fetchAdminInstructors } from "../api/adminInstructorsApi";
import { fetchInstructorCourses } from "../api/instructorApi";
import { useAuth } from "../context/AuthContext";

type CourseOption = {
  id: number;
  shortName: string;
  title: string;
};

type AnnouncementForm = {
  title: string;
  message: string;
  target: AnnouncementTarget;
  courseId: string;
};

const emptyForm: AnnouncementForm = {
  title: "",
  message: "",
  target: "ALL",
  courseId: "",
};

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTargetLabel(target: AnnouncementTarget) {
  if (target === "ALL") {
    return "Everyone";
  }

  if (target === "STUDENTS") {
    return "Students";
  }

  if (target === "INSTRUCTORS") {
    return "Instructors";
  }

  return "Course";
}

function AnnouncementsPage() {
  const { token, user, isAuthenticated, isAuthLoading } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [announcementForm, setAnnouncementForm] =
    useState<AnnouncementForm>(emptyForm);

  const [editingAnnouncementId, setEditingAnnouncementId] = useState<
    number | null
  >(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const canManageAnnouncements =
    user?.role === "ADMIN" || user?.role === "INSTRUCTOR";

  async function loadAnnouncements() {
    if (!token || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setErrorMessage("");

      const announcementsData = await fetchAnnouncements(token);
      setAnnouncements(announcementsData);

      if (user.role === "ADMIN") {
        const adminData = await fetchAdminInstructors(token);

        setCourseOptions(
          adminData.courses.map((course) => ({
            id: course.id,
            shortName: course.shortName,
            title: course.title,
          })),
        );
      }

      if (user.role === "INSTRUCTOR") {
        const instructorCourses = await fetchInstructorCourses(token);

        setCourseOptions(
          instructorCourses.map((course) => ({
            id: course.id,
            shortName: course.shortName,
            title: course.title,
          })),
        );
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load announcements.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAnnouncements();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.role]);

  const filteredAnnouncements = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (!normalizedSearch) {
      return announcements;
    }

    return announcements.filter((announcement) => {
      return (
        announcement.title.toLowerCase().includes(normalizedSearch) ||
        announcement.message.toLowerCase().includes(normalizedSearch) ||
        announcement.author.name.toLowerCase().includes(normalizedSearch) ||
        announcement.course?.title.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [announcements, searchQuery]);

  function resetForm() {
    setAnnouncementForm(
      user?.role === "INSTRUCTOR"
        ? {
            ...emptyForm,
            target: "COURSE",
          }
        : emptyForm,
    );
    setEditingAnnouncementId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !user) {
      return;
    }

    const target =
      user.role === "INSTRUCTOR" ? "COURSE" : announcementForm.target;

    const courseId =
      target === "COURSE" ? Number(announcementForm.courseId) : null;

    const payload: AnnouncementPayload = {
      title: announcementForm.title,
      message: announcementForm.message,
      target,
      courseId,
    };

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (editingAnnouncementId) {
        await updateAnnouncement(token, editingAnnouncementId, payload);
        setSuccessMessage("Announcement updated successfully.");
      } else {
        await createAnnouncement(token, payload);
        setSuccessMessage("Announcement created successfully.");
      }

      resetForm();
      await loadAnnouncements();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save announcement.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function startEditing(announcement: Announcement) {
    setEditingAnnouncementId(announcement.id);
    setAnnouncementForm({
      title: announcement.title,
      message: announcement.message,
      target: announcement.target,
      courseId: announcement.courseId ? String(announcement.courseId) : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(announcement: Announcement) {
    if (!token) {
      return;
    }

    const shouldDelete = window.confirm(
      `Delete announcement "${announcement.title}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteAnnouncement(token, announcement.id);
      setSuccessMessage("Announcement deleted successfully.");
      await loadAnnouncements();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete announcement.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isAuthLoading) {
    return <p className="status-text">Checking announcement access...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="admin-page">
      <div className="admin-hero-card">
        <div>
          <p className="small-heading">ANNOUNCEMENTS</p>
          <h1>Notices & Updates</h1>
          <p>
            View important platform updates, course notices and role-based
            announcements in one place.
          </p>
        </div>
      </div>

      {isLoading && <p className="status-text">Loading announcements...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}
      {successMessage && <p className="success-text">{successMessage}</p>}

      {!isLoading && canManageAnnouncements && (
        <form className="announcement-form-card" onSubmit={handleSubmit}>
          <div>
            <p className="small-heading">CREATE NOTICE</p>
            <h2>
              {editingAnnouncementId
                ? "Edit Announcement"
                : "Create Announcement"}
            </h2>
          </div>

          <div className="announcement-form-grid">
            <label>
              Title
              <input
                type="text"
                value={announcementForm.title}
                onChange={(event) =>
                  setAnnouncementForm((currentForm) => ({
                    ...currentForm,
                    title: event.target.value,
                  }))
                }
                placeholder="Example: New quiz is available"
                required
              />
            </label>

            {user?.role === "ADMIN" && (
              <label>
                Target
                <select
                  value={announcementForm.target}
                  onChange={(event) =>
                    setAnnouncementForm((currentForm) => ({
                      ...currentForm,
                      target: event.target.value as AnnouncementTarget,
                      courseId:
                        event.target.value === "COURSE"
                          ? currentForm.courseId
                          : "",
                    }))
                  }
                >
                  <option value="ALL">Everyone</option>
                  <option value="STUDENTS">Students</option>
                  <option value="INSTRUCTORS">Instructors</option>
                  <option value="COURSE">Specific Course</option>
                </select>
              </label>
            )}

            {user?.role === "INSTRUCTOR" && (
              <label>
                Target
                <select value="COURSE" disabled>
                  <option value="COURSE">Assigned Course</option>
                </select>
              </label>
            )}

            {(announcementForm.target === "COURSE" ||
              user?.role === "INSTRUCTOR") && (
              <label>
                Course
                <select
                  value={announcementForm.courseId}
                  onChange={(event) =>
                    setAnnouncementForm((currentForm) => ({
                      ...currentForm,
                      courseId: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Choose course</option>
                  {courseOptions.map((course) => (
                    <option value={course.id} key={course.id}>
                      {course.title} ({course.shortName})
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <label>
            Message
            <textarea
              value={announcementForm.message}
              onChange={(event) =>
                setAnnouncementForm((currentForm) => ({
                  ...currentForm,
                  message: event.target.value,
                }))
              }
              placeholder="Write announcement details..."
              rows={4}
              required
            />
          </label>

          <div className="instructor-form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={isSaving}
            >
              {editingAnnouncementId
                ? "Update Announcement"
                : "Create Announcement"}
            </button>

            {editingAnnouncementId && (
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {!isLoading && (
        <>
          <div className="student-management-toolbar">
            <label>
              Search Announcements
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by title, message, author or course..."
              />
            </label>

            <p>
              Showing <strong>{filteredAnnouncements.length}</strong> of{" "}
              <strong>{announcements.length}</strong> announcements
            </p>
          </div>

          {filteredAnnouncements.length === 0 ? (
            <div className="empty-dashboard-card">
              <h2>No announcements found</h2>
              <p>There are no notices matching your current view.</p>
            </div>
          ) : (
            <div className="announcement-list">
              {filteredAnnouncements.map((announcement) => {
                const canEdit =
                  user?.role === "ADMIN" ||
                  (user?.role === "INSTRUCTOR" &&
                    announcement.authorId === user.id);

                return (
                  <article
                    className="announcement-card"
                    key={announcement.id}
                  >
                    <div className="announcement-card-header">
                      <div>
                        <p className="announcement-target-pill">
                          {getTargetLabel(announcement.target)}
                        </p>
                        <h2>{announcement.title}</h2>
                      </div>

                      {canEdit && (
                        <div className="curriculum-actions">
                          <button
                            type="button"
                            onClick={() => startEditing(announcement)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(announcement)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="announcement-message">
                      {announcement.message}
                    </p>

                    <div className="announcement-meta">
                      <span>By {announcement.author.name}</span>
                      <span>{announcement.author.role}</span>
                      <span>{formatDate(announcement.createdAt)}</span>
                      {announcement.course && (
                        <span>
                          {announcement.course.shortName} —{" "}
                          {announcement.course.title}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default AnnouncementsPage;