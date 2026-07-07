import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";

import {
  addSupportTicketReply,
  createSupportTicket,
  deleteSupportTicket,
  fetchSupportTickets,
  updateSupportTicketStatus,
  type SupportTicket,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from "../api/supportTicketsApi";
import { useAuth } from "../context/AuthContext";

type SupportForm = {
  title: string;
  message: string;
  category: string;
  priority: SupportTicketPriority;
};

const emptySupportForm: SupportForm = {
  title: "",
  message: "",
  category: "General",
  priority: "MEDIUM",
};

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status: SupportTicketStatus) {
  if (status === "IN_PROGRESS") {
    return "IN PROGRESS";
  }

  return status;
}

function SupportPage() {
  const { token, user, isAuthenticated, isAuthLoading } = useAuth();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [supportForm, setSupportForm] = useState<SupportForm>(emptySupportForm);
  const [replyForms, setReplyForms] = useState<Record<number, string>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "ALL">(
    "ALL",
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadTickets() {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setErrorMessage("");
      const data = await fetchSupportTickets(token);
      setTickets(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load support tickets.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTickets();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.role]);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === "ALL" || ticket.status === statusFilter;

      const matchesSearch =
        !normalizedSearch ||
        ticket.title.toLowerCase().includes(normalizedSearch) ||
        ticket.message.toLowerCase().includes(normalizedSearch) ||
        ticket.category.toLowerCase().includes(normalizedSearch) ||
        ticket.user.name.toLowerCase().includes(normalizedSearch) ||
        ticket.user.email.toLowerCase().includes(normalizedSearch) ||
        ticket.replies.some(
          (reply) =>
            reply.message.toLowerCase().includes(normalizedSearch) ||
            reply.author.name.toLowerCase().includes(normalizedSearch),
        );

      return matchesStatus && matchesSearch;
    });
  }, [tickets, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "OPEN").length,
      inProgress: tickets.filter((ticket) => ticket.status === "IN_PROGRESS")
        .length,
      resolved: tickets.filter((ticket) => ticket.status === "RESOLVED")
        .length,
      closed: tickets.filter((ticket) => ticket.status === "CLOSED").length,
    };
  }, [tickets]);

  async function handleCreateTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await createSupportTicket(token, supportForm);

      setSupportForm(emptySupportForm);
      setSuccessMessage("Support ticket created successfully.");
      await loadTickets();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create support ticket.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddReply(
    event: FormEvent<HTMLFormElement>,
    ticketId: number,
  ) {
    event.preventDefault();

    if (!token) {
      return;
    }

    const message = replyForms[ticketId]?.trim();

    if (!message) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await addSupportTicketReply(token, ticketId, message);

      setReplyForms((currentForms) => ({
        ...currentForms,
        [ticketId]: "",
      }));

      setSuccessMessage("Reply added successfully.");
      await loadTickets();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to add reply.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusChange(
    ticket: SupportTicket,
    status: SupportTicketStatus,
  ) {
    if (!token) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await updateSupportTicketStatus(token, ticket.id, status);

      setSuccessMessage("Support ticket status updated successfully.");
      await loadTickets();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update support ticket.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTicket(ticket: SupportTicket) {
    if (!token) {
      return;
    }

    const shouldDelete = window.confirm(`Delete ticket "${ticket.title}"?`);

    if (!shouldDelete) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteSupportTicket(token, ticket.id);

      setSuccessMessage("Support ticket deleted successfully.");
      await loadTickets();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete support ticket.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isAuthLoading) {
    return <p className="status-text">Checking support access...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="admin-page">
      <div className="admin-hero-card">
        <div>
          <p className="small-heading">CONTACT & SUPPORT</p>
          <h1>Support Center</h1>
          <p>
            Raise issues, ask for help, track replies and manage support ticket
            status from one place.
          </p>
        </div>
      </div>

      {isLoading && <p className="status-text">Loading support tickets...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}
      {successMessage && <p className="success-text">{successMessage}</p>}

      {!isLoading && (
        <>
          <div className="admin-stats-grid">
            <div className="dashboard-card">
              <p>Total Tickets</p>
              <h2>{stats.total}</h2>
              <span>{user?.role === "ADMIN" ? "All users" : "Your tickets"}</span>
            </div>

            <div className="dashboard-card">
              <p>Open</p>
              <h2>{stats.open}</h2>
              <span>New requests</span>
            </div>

            <div className="dashboard-card">
              <p>In Progress</p>
              <h2>{stats.inProgress}</h2>
              <span>Being handled</span>
            </div>

            <div className="dashboard-card">
              <p>Resolved</p>
              <h2>{stats.resolved}</h2>
              <span>Answered tickets</span>
            </div>

            <div className="dashboard-card">
              <p>Closed</p>
              <h2>{stats.closed}</h2>
              <span>Completed tickets</span>
            </div>
          </div>

          {user?.role !== "ADMIN" && (
            <form className="support-form-card" onSubmit={handleCreateTicket}>
              <div>
                <p className="small-heading">CREATE SUPPORT REQUEST</p>
                <h2>New Ticket</h2>
              </div>

              <div className="support-form-grid">
                <label>
                  Category
                  <select
                    value={supportForm.category}
                    onChange={(event) =>
                      setSupportForm((currentForm) => ({
                        ...currentForm,
                        category: event.target.value,
                      }))
                    }
                  >
                    <option value="General">General</option>
                    <option value="Course">Course</option>
                    <option value="Account">Account</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Technical">Technical</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label>
                  Priority
                  <select
                    value={supportForm.priority}
                    onChange={(event) =>
                      setSupportForm((currentForm) => ({
                        ...currentForm,
                        priority: event.target.value as SupportTicketPriority,
                      }))
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </label>

                <label>
                  Title
                  <input
                    type="text"
                    value={supportForm.title}
                    onChange={(event) =>
                      setSupportForm((currentForm) => ({
                        ...currentForm,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Example: Certificate not generated"
                    required
                  />
                </label>
              </div>

              <label>
                Message
                <textarea
                  value={supportForm.message}
                  onChange={(event) =>
                    setSupportForm((currentForm) => ({
                      ...currentForm,
                      message: event.target.value,
                    }))
                  }
                  placeholder="Explain your issue clearly..."
                  rows={4}
                  required
                />
              </label>

              <button type="submit" className="primary-button" disabled={isSaving}>
                Submit Ticket
              </button>
            </form>
          )}

          <div className="student-management-toolbar">
            <label>
              Search Tickets
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search title, message, user, reply..."
              />
            </label>

            <label>
              Status
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as SupportTicketStatus | "ALL",
                  )
                }
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </label>

            <p>
              Showing <strong>{filteredTickets.length}</strong> of{" "}
              <strong>{tickets.length}</strong> tickets
            </p>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="empty-dashboard-card">
              <h2>No support tickets found</h2>
              <p>No ticket matches your current search or filter.</p>
            </div>
          ) : (
            <div className="support-ticket-list">
              {filteredTickets.map((ticket) => (
                <article className="support-ticket-card" key={ticket.id}>
                  <div className="support-ticket-header">
                    <div>
                      <div className="support-pill-row">
                        <p
                          className={`support-status-pill ${ticket.status.toLowerCase()}`}
                        >
                          {getStatusLabel(ticket.status)}
                        </p>

                        <p
                          className={`support-priority-pill ${ticket.priority.toLowerCase()}`}
                        >
                          {ticket.priority}
                        </p>

                        <p className="announcement-target-pill">
                          {ticket.category}
                        </p>
                      </div>

                      <h2>{ticket.title}</h2>
                    </div>

                    {user?.role === "ADMIN" && (
                      <div className="support-admin-actions">
                        <select
                          value={ticket.status}
                          onChange={(event) =>
                            handleStatusChange(
                              ticket,
                              event.target.value as SupportTicketStatus,
                            )
                          }
                          disabled={isSaving}
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>

                        <button
                          type="button"
                          className="danger-outline-button"
                          disabled={isSaving}
                          onClick={() => handleDeleteTicket(ticket)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="support-message">{ticket.message}</p>

                  <div className="announcement-meta">
                    <span>Raised by {ticket.user.name}</span>
                    <span>{ticket.user.role}</span>
                    <span>{ticket.user.email}</span>
                    <span>{formatDate(ticket.createdAt)}</span>
                    <span>{ticket.replies.length} replies</span>
                  </div>

                  {ticket.replies.length > 0 && (
                    <div className="reply-list">
                      {ticket.replies.map((reply) => (
                        <article className="reply-card" key={reply.id}>
                          <div>
                            <p>{reply.message}</p>

                            <div className="announcement-meta">
                              <span>By {reply.author.name}</span>
                              <span>{reply.author.role}</span>
                              <span>{formatDate(reply.createdAt)}</span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}

                  {ticket.status === "CLOSED" ? (
                    <p className="status-text left-status-text">
                      This ticket is closed. New replies are disabled.
                    </p>
                  ) : (
                    <form
                      className="reply-form"
                      onSubmit={(event) => handleAddReply(event, ticket.id)}
                    >
                      <input
                        type="text"
                        value={replyForms[ticket.id] || ""}
                        onChange={(event) =>
                          setReplyForms((currentForms) => ({
                            ...currentForms,
                            [ticket.id]: event.target.value,
                          }))
                        }
                        placeholder="Write a support reply..."
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

export default SupportPage;