import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";

import {
  addDiscussionReply,
  createDiscussion,
  deleteDiscussion,
  deleteDiscussionReply,
  fetchDiscussions,
  updateDiscussionStatus,
  type CourseDiscussion,
  type CourseWithDiscussions,
  type DiscussionReply,
  type DiscussionStatus,
} from "../api/discussionsApi";
import { useAuth } from "../context/AuthContext";

type DiscussionForm = {
  courseId: string;
  title: string;
  message: string;
};

const emptyDiscussionForm: DiscussionForm = {
  courseId: "",
  title: "",
  message: "",
};

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function CourseDiscussionsPage() {
  const { token, user, isAuthenticated, isAuthLoading } = useAuth();

  const [courses, setCourses] = useState<CourseWithDiscussions[]>([]);
  const [discussionForm, setDiscussionForm] =
    useState<DiscussionForm>(emptyDiscussionForm);

  const [replyForms, setReplyForms] = useState<Record<number, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DiscussionStatus | "ALL">(
    "ALL",
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadDiscussions() {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setErrorMessage("");
      const data = await fetchDiscussions(token);
      setCourses(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load discussions.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDiscussions();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.role]);

  const totalDiscussions = useMemo(() => {
    return courses.reduce(
      (total, course) => total + course.discussions.length,
      0,
    );
  }, [courses]);

  const openDiscussions = useMemo(() => {
    return courses.reduce((total, course) => {
      return (
        total +
        course.discussions.filter((discussion) => discussion.status === "OPEN")
          .length
      );
    }, 0);
  }, [courses]);

  const totalReplies = useMemo(() => {
    return courses.reduce((total, course) => {
      return (
        total +
        course.discussions.reduce(
          (replyTotal, discussion) => replyTotal + discussion.replies.length,
          0,
        )
      );
    }, 0);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return courses
      .map((course) => {
        const filteredDiscussions = course.discussions.filter((discussion) => {
          const matchesStatus =
            statusFilter === "ALL" || discussion.status === statusFilter;

          const matchesSearch =
            !normalizedSearch ||
            course.title.toLowerCase().includes(normalizedSearch) ||
            course.shortName.toLowerCase().includes(normalizedSearch) ||
            discussion.title.toLowerCase().includes(normalizedSearch) ||
            discussion.message.toLowerCase().includes(normalizedSearch) ||
            discussion.author.name.toLowerCase().includes(normalizedSearch) ||
            discussion.replies.some(
              (reply) =>
                reply.message.toLowerCase().includes(normalizedSearch) ||
                reply.author.name.toLowerCase().includes(normalizedSearch),
            );

          return matchesStatus && matchesSearch;
        });

        return {
          ...course,
          discussions: filteredDiscussions,
        };
      })
      .filter((course) => {
        if (course.discussions.length > 0) {
          return true;
        }

        if (!normalizedSearch && statusFilter === "ALL") {
          return true;
        }

        return false;
      });
  }, [courses, searchQuery, statusFilter]);

  async function handleCreateDiscussion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await createDiscussion(token, {
        courseId: Number(discussionForm.courseId),
        title: discussionForm.title,
        message: discussionForm.message,
      });

      setDiscussionForm(emptyDiscussionForm);
      setSuccessMessage("Discussion created successfully.");
      await loadDiscussions();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create discussion.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddReply(
    event: FormEvent<HTMLFormElement>,
    discussionId: number,
  ) {
    event.preventDefault();

    if (!token) {
      return;
    }

    const message = replyForms[discussionId]?.trim();

    if (!message) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await addDiscussionReply(token, discussionId, message);

      setReplyForms((currentForms) => ({
        ...currentForms,
        [discussionId]: "",
      }));

      setSuccessMessage("Reply added successfully.");
      await loadDiscussions();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to add reply.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusChange(
    discussion: CourseDiscussion,
    status: DiscussionStatus,
  ) {
    if (!token) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await updateDiscussionStatus(token, discussion.id, status);

      setSuccessMessage(
        status === "RESOLVED"
          ? "Discussion marked as resolved."
          : "Discussion reopened successfully.",
      );

      await loadDiscussions();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update discussion status.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteDiscussion(discussion: CourseDiscussion) {
    if (!token) {
      return;
    }

    const shouldDelete = window.confirm(
      `Delete discussion "${discussion.title}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteDiscussion(token, discussion.id);

      setSuccessMessage("Discussion deleted successfully.");
      await loadDiscussions();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete discussion.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteReply(reply: DiscussionReply) {
    if (!token) {
      return;
    }

    const shouldDelete = window.confirm("Delete this reply?");

    if (!shouldDelete) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteDiscussionReply(token, reply.id);

      setSuccessMessage("Reply deleted successfully.");
      await loadDiscussions();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete reply.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function canDeleteDiscussion(discussion: CourseDiscussion) {
    if (user?.role === "ADMIN" || user?.role === "INSTRUCTOR") {
      return true;
    }

    return discussion.authorId === user?.id;
  }

  function canDeleteReply(reply: DiscussionReply) {
    if (user?.role === "ADMIN" || user?.role === "INSTRUCTOR") {
      return true;
    }

    return reply.authorId === user?.id;
  }

  function canUpdateStatus(discussion: CourseDiscussion) {
    if (user?.role === "ADMIN" || user?.role === "INSTRUCTOR") {
      return true;
    }

    return discussion.authorId === user?.id;
  }

  if (isAuthLoading) {
    return <p className="status-text">Checking discussion access...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="admin-page">
      <div className="admin-hero-card">
        <div>
          <p className="small-heading">COURSE DISCUSSIONS</p>
          <h1>Doubt Section</h1>
          <p>
            Ask questions, reply to course doubts and mark discussions as open
            or resolved.
          </p>
        </div>
      </div>

      {isLoading && <p className="status-text">Loading discussions...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}
      {successMessage && <p className="success-text">{successMessage}</p>}

      {!isLoading && (
        <>
          <div className="admin-stats-grid">
            <div className="dashboard-card">
              <p>Courses</p>
              <h2>{courses.length}</h2>
              <span>Available for discussion</span>
            </div>

            <div className="dashboard-card">
              <p>Total Doubts</p>
              <h2>{totalDiscussions}</h2>
              <span>Course discussions</span>
            </div>

            <div className="dashboard-card">
              <p>Open Doubts</p>
              <h2>{openDiscussions}</h2>
              <span>Need attention</span>
            </div>

            <div className="dashboard-card">
              <p>Replies</p>
              <h2>{totalReplies}</h2>
              <span>Total discussion replies</span>
            </div>
          </div>

          <form className="discussion-form-card" onSubmit={handleCreateDiscussion}>
            <div>
              <p className="small-heading">ASK A DOUBT</p>
              <h2>Create Discussion</h2>
            </div>

            <div className="discussion-form-grid">
              <label>
                Course
                <select
                  value={discussionForm.courseId}
                  onChange={(event) =>
                    setDiscussionForm((currentForm) => ({
                      ...currentForm,
                      courseId: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Choose course</option>
                  {courses.map((course) => (
                    <option value={course.id} key={course.id}>
                      {course.title} ({course.shortName})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Title
                <input
                  type="text"
                  value={discussionForm.title}
                  onChange={(event) =>
                    setDiscussionForm((currentForm) => ({
                      ...currentForm,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Example: Doubt in lesson 2"
                  required
                />
              </label>
            </div>

            <label>
              Message
              <textarea
                value={discussionForm.message}
                onChange={(event) =>
                  setDiscussionForm((currentForm) => ({
                    ...currentForm,
                    message: event.target.value,
                  }))
                }
                placeholder="Explain your doubt clearly..."
                rows={4}
                required
              />
            </label>

            <button type="submit" className="primary-button" disabled={isSaving}>
              Post Discussion
            </button>
          </form>

          <div className="student-management-toolbar">
            <label>
              Search Discussions
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search course, doubt, reply or person..."
              />
            </label>

            <label>
              Status
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as DiscussionStatus | "ALL")
                }
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </label>

            <p>
              Showing <strong>{filteredCourses.length}</strong> courses
            </p>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="empty-dashboard-card">
              <h2>No discussions found</h2>
              <p>No doubts match your current search or filter.</p>
            </div>
          ) : (
            <div className="discussion-course-list">
              {filteredCourses.map((course) => (
                <article className="discussion-course-card" key={course.id}>
                  <div className="resource-course-header">
                    <div className="analytics-course-cell">
                      <div className="course-icon">{course.shortName}</div>

                      <div>
                        <p className="course-category-pill">
                          {course.category}
                        </p>
                        <h2>{course.title}</h2>
                        <span>
                          {course.level} • {course.discussions.length} doubts
                        </span>
                      </div>
                    </div>
                  </div>

                  {course.discussions.length === 0 ? (
                    <p className="status-text left-status-text">
                      No discussions yet for this course.
                    </p>
                  ) : (
                    <div className="discussion-list">
                      {course.discussions.map((discussion) => (
                        <article
                          className="discussion-card"
                          key={discussion.id}
                        >
                          <div className="discussion-card-header">
                            <div>
                              <p
                                className={`discussion-status-pill ${
                                  discussion.status === "RESOLVED"
                                    ? "resolved"
                                    : ""
                                }`}
                              >
                                {discussion.status}
                              </p>
                              <h3>{discussion.title}</h3>
                            </div>

                            <div className="discussion-actions">
                              {canUpdateStatus(discussion) && (
                                <button
                                  type="button"
                                  className="secondary-button"
                                  disabled={isSaving}
                                  onClick={() =>
                                    handleStatusChange(
                                      discussion,
                                      discussion.status === "OPEN"
                                        ? "RESOLVED"
                                        : "OPEN",
                                    )
                                  }
                                >
                                  {discussion.status === "OPEN"
                                    ? "Mark Resolved"
                                    : "Reopen"}
                                </button>
                              )}

                              {canDeleteDiscussion(discussion) && (
                                <button
                                  type="button"
                                  className="danger-outline-button"
                                  disabled={isSaving}
                                  onClick={() =>
                                    handleDeleteDiscussion(discussion)
                                  }
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>

                          <p className="discussion-message">
                            {discussion.message}
                          </p>

                          <div className="announcement-meta">
                            <span>By {discussion.author.name}</span>
                            <span>{discussion.author.role}</span>
                            <span>{formatDate(discussion.createdAt)}</span>
                            <span>{discussion.replies.length} replies</span>
                          </div>

                          {discussion.replies.length > 0 && (
                            <div className="reply-list">
                              {discussion.replies.map((reply) => (
                                <article className="reply-card" key={reply.id}>
                                  <div>
                                    <p>{reply.message}</p>

                                    <div className="announcement-meta">
                                      <span>By {reply.author.name}</span>
                                      <span>{reply.author.role}</span>
                                      <span>{formatDate(reply.createdAt)}</span>
                                    </div>
                                  </div>

                                  {canDeleteReply(reply) && (
                                    <button
                                      type="button"
                                      className="danger-outline-button"
                                      disabled={isSaving}
                                      onClick={() => handleDeleteReply(reply)}
                                    >
                                      Delete
                                    </button>
                                  )}
                                </article>
                              ))}
                            </div>
                          )}

                          <form
                            className="reply-form"
                            onSubmit={(event) =>
                              handleAddReply(event, discussion.id)
                            }
                          >
                            <input
                              type="text"
                              value={replyForms[discussion.id] || ""}
                              onChange={(event) =>
                                setReplyForms((currentForms) => ({
                                  ...currentForms,
                                  [discussion.id]: event.target.value,
                                }))
                              }
                              placeholder="Write a reply..."
                              required
                            />

                            <button
                              type="submit"
                              className="primary-button"
                              disabled={isSaving}
                            >
                              Reply
                            </button>
                          </form>
                        </article>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default CourseDiscussionsPage;