import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  fetchAdminActivityLogs,
  type ActivityLog,
  type ActivityLogFilters,
  type AdminActivityLogsResponse,
} from "../api/adminActivityLogsApi";
import { useAuth } from "../context/AuthContext";

type ActivityFilterForm = {
  search: string;
  action: string;
  entityType: string;
  limit: string;
};

const defaultFilterForm: ActivityFilterForm = {
  search: "",
  action: "",
  entityType: "",
  limit: "50",
};

function formatDateTime(dateValue: string) {
  return new Date(dateValue).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAction(action: string) {
  return action.replace(/_/g, " ");
}

function getActivityIcon(entityType: string) {
  const normalizedType = entityType.toUpperCase();

  if (normalizedType.includes("ANNOUNCEMENT")) {
    return "📢";
  }

  if (normalizedType.includes("RESOURCE")) {
    return "📚";
  }

  if (normalizedType.includes("DISCUSSION")) {
    return "💬";
  }

  if (normalizedType.includes("SUPPORT")) {
    return "🎧";
  }

  if (normalizedType.includes("COURSE")) {
    return "🎓";
  }

  if (normalizedType.includes("USER")) {
    return "👤";
  }

  return "🧾";
}

function getMetadataEntries(log: ActivityLog) {
  if (!log.metadata) {
    return [];
  }

  return Object.entries(log.metadata).filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );
}

function AdminActivityLogsPage() {
  const { token } = useAuth();

  const [activityData, setActivityData] =
    useState<AdminActivityLogsResponse | null>(null);

  const [filterForm, setFilterForm] =
    useState<ActivityFilterForm>(defaultFilterForm);

  const [activeFilters, setActiveFilters] =
    useState<ActivityFilterForm>(defaultFilterForm);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadActivityLogs(filters: ActivityFilterForm) {
    if (!token) {
      setErrorMessage("Admin token is missing.");
      setIsLoading(false);
      return;
    }

    const requestFilters: ActivityLogFilters = {
      search: filters.search.trim(),
      action: filters.action.trim(),
      entityType: filters.entityType.trim(),
      limit: Number(filters.limit) || 50,
    };

    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await fetchAdminActivityLogs(token, requestFilters);
      setActivityData(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load activity logs.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadActivityLogs(activeFilters);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeFilters]);

  const uniqueActions = useMemo(() => {
    if (!activityData) {
      return [];
    }

    return Array.from(new Set(activityData.logs.map((log) => log.action))).sort();
  }, [activityData]);

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveFilters(filterForm);
  }

  function handleResetFilters() {
    setFilterForm(defaultFilterForm);
    setActiveFilters(defaultFilterForm);
  }

  const stats = activityData?.stats;

  return (
    <section className="admin-page">
      <div className="admin-hero-card">
        <div>
          <p className="small-heading">ADMIN ACTIVITY LOGS</p>
          <h1>Activity Logs</h1>
          <p>
            Track successful system actions like announcements, resources,
            support tickets, discussions and instructor management.
          </p>
        </div>
      </div>

      {isLoading && <p className="status-text">Loading activity logs...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!isLoading && activityData && stats && (
        <>
          <div className="admin-stats-grid">
            <div className="dashboard-card">
              <p>Total Logs</p>
              <h2>{stats.totalLogs}</h2>
              <span>All recorded actions</span>
            </div>

            <div className="dashboard-card">
              <p>Today</p>
              <h2>{stats.todayLogs}</h2>
              <span>Actions recorded today</span>
            </div>

            <div className="dashboard-card">
              <p>Filtered</p>
              <h2>{stats.filteredCount}</h2>
              <span>Matching current filters</span>
            </div>

            <div className="dashboard-card">
              <p>Displayed</p>
              <h2>{stats.displayedLogs}</h2>
              <span>Visible on this page</span>
            </div>
          </div>

          <form className="activity-filter-card" onSubmit={handleFilterSubmit}>
            <div>
              <p className="small-heading">FILTER LOGS</p>
              <h2>Search Activity</h2>
            </div>

            <div className="activity-filter-grid">
              <label>
                Search
                <input
                  type="text"
                  value={filterForm.search}
                  onChange={(event) =>
                    setFilterForm((currentForm) => ({
                      ...currentForm,
                      search: event.target.value,
                    }))
                  }
                  placeholder="Search message, action or entity..."
                />
              </label>

              <label>
                Action
                <select
                  value={filterForm.action}
                  onChange={(event) =>
                    setFilterForm((currentForm) => ({
                      ...currentForm,
                      action: event.target.value,
                    }))
                  }
                >
                  <option value="">All Actions</option>
                  {uniqueActions.map((action) => (
                    <option value={action} key={action}>
                      {formatAction(action)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Entity Type
                <select
                  value={filterForm.entityType}
                  onChange={(event) =>
                    setFilterForm((currentForm) => ({
                      ...currentForm,
                      entityType: event.target.value,
                    }))
                  }
                >
                  <option value="">All Entity Types</option>
                  {activityData.entityTypes.map((entityType) => (
                    <option value={entityType} key={entityType}>
                      {formatAction(entityType)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Limit
                <select
                  value={filterForm.limit}
                  onChange={(event) =>
                    setFilterForm((currentForm) => ({
                      ...currentForm,
                      limit: event.target.value,
                    }))
                  }
                >
                  <option value="25">25 logs</option>
                  <option value="50">50 logs</option>
                  <option value="75">75 logs</option>
                  <option value="100">100 logs</option>
                </select>
              </label>
            </div>

            <div className="instructor-form-actions">
              <button type="submit" className="primary-button">
                Apply Filters
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={handleResetFilters}
              >
                Reset
              </button>
            </div>
          </form>

          {activityData.topActions.length > 0 && (
            <div className="activity-top-actions-card">
              <div>
                <p className="small-heading">MOST RECENT ACTION TYPES</p>
                <h2>Top Actions</h2>
              </div>

              <div className="activity-top-actions-grid">
                {activityData.topActions.map((action) => (
                  <div className="activity-top-action-pill" key={action.name}>
                    <span>{formatAction(action.name)}</span>
                    <strong>{action.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activityData.logs.length === 0 ? (
            <div className="empty-dashboard-card">
              <h2>No activity logs found</h2>
              <p>
                Try removing filters, or perform a new action like creating an
                announcement, support ticket, resource or discussion.
              </p>
            </div>
          ) : (
            <div className="activity-log-timeline">
              {activityData.logs.map((log) => {
                const metadataEntries = getMetadataEntries(log);

                return (
                  <article className="activity-log-card" key={log.id}>
                    <div className="activity-log-icon">
                      {getActivityIcon(log.entityType)}
                    </div>

                    <div className="activity-log-content">
                      <div className="activity-log-header">
                        <div>
                          <p className="activity-action-pill">
                            {formatAction(log.action)}
                          </p>
                          <h2>{log.message}</h2>
                        </div>

                        <span>{formatDateTime(log.createdAt)}</span>
                      </div>

                      <div className="announcement-meta">
                        <span>Entity: {formatAction(log.entityType)}</span>

                        {log.entityId && <span>ID: {log.entityId}</span>}

                        {log.actor ? (
                          <>
                            <span>By {log.actor.name}</span>
                            <span>{log.actor.role}</span>
                            <span>{log.actor.email}</span>
                          </>
                        ) : (
                          <span>System / deleted user</span>
                        )}
                      </div>

                      {metadataEntries.length > 0 && (
                        <details className="activity-metadata-panel">
                          <summary>View technical details</summary>

                          <div className="activity-metadata-grid">
                            {metadataEntries.map(([key, value]) => (
                              <div key={key}>
                                <span>{key}</span>
                                <strong>{String(value)}</strong>
                              </div>
                            ))}
                          </div>
                        </details>
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

export default AdminActivityLogsPage;