const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export type SupportTicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type SupportTicketPriority = "LOW" | "MEDIUM" | "HIGH";

export type SupportUser = {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
};

export type SupportTicketReply = {
  id: number;
  message: string;
  ticketId: number;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author: SupportUser;
};

export type SupportTicket = {
  id: number;
  title: string;
  message: string;
  category: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: SupportUser;
  replies: SupportTicketReply[];
};

export type CreateSupportTicketPayload = {
  title: string;
  message: string;
  category: string;
  priority: SupportTicketPriority;
};

export async function fetchSupportTickets(
  token: string,
): Promise<SupportTicket[]> {
  const response = await fetch(`${API_BASE_URL}/support-tickets`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load support tickets.");
  }

  return data.data.tickets;
}

export async function createSupportTicket(
  token: string,
  payload: CreateSupportTicketPayload,
): Promise<SupportTicket> {
  const response = await fetch(`${API_BASE_URL}/support-tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to create support ticket.");
  }

  return data.data.ticket;
}

export async function addSupportTicketReply(
  token: string,
  ticketId: number,
  message: string,
): Promise<SupportTicketReply> {
  const response = await fetch(
    `${API_BASE_URL}/support-tickets/${ticketId}/replies`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to add support reply.");
  }

  return data.data.reply;
}

export async function updateSupportTicketStatus(
  token: string,
  ticketId: number,
  status: SupportTicketStatus,
): Promise<SupportTicket> {
  const response = await fetch(
    `${API_BASE_URL}/support-tickets/${ticketId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update support status.");
  }

  return data.data.ticket;
}

export async function deleteSupportTicket(token: string, ticketId: number) {
  const response = await fetch(`${API_BASE_URL}/support-tickets/${ticketId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete support ticket.");
  }

  return data;
}