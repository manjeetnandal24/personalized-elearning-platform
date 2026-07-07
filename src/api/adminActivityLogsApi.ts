const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export type ActivityLogActor = {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
};

export type ActivityLogMetadata = Record<
  string,
  string | number | boolean | null
>;

export type ActivityLog = {
  id: number;
  action: string;
  message: string;
  entityType: string;
  entityId: number | null;
  actorId: number | null;
  metadata: ActivityLogMetadata | null;
  createdAt: string;
  actor: ActivityLogActor | null;
};

export type ActivityLogStats = {
  totalLogs: number;
  filteredCount: number;
  todayLogs: number;
  displayedLogs: number;
};

export type TopActivityAction = {
  name: string;
  count: number;
};

export type AdminActivityLogsResponse = {
  stats: ActivityLogStats;
  topActions: TopActivityAction[];
  entityTypes: string[];
  logs: ActivityLog[];
};

export type ActivityLogFilters = {
  search?: string;
  action?: string;
  entityType?: string;
  limit?: number;
};

export async function fetchAdminActivityLogs(
  token: string,
  filters: ActivityLogFilters = {},
): Promise<AdminActivityLogsResponse> {
  const searchParams = new URLSearchParams();

  if (filters.search) {
    searchParams.set("search", filters.search);
  }

  if (filters.action) {
    searchParams.set("action", filters.action);
  }

  if (filters.entityType) {
    searchParams.set("entityType", filters.entityType);
  }

  if (filters.limit) {
    searchParams.set("limit", String(filters.limit));
  }

  const queryString = searchParams.toString();

  const response = await fetch(
    `${API_BASE_URL}/admin/activity-logs${queryString ? `?${queryString}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load activity logs.");
  }

  return data.data;
}