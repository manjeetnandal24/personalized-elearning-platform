const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export type DiscussionStatus = "OPEN" | "RESOLVED";

export type DiscussionAuthor = {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
};

export type DiscussionReply = {
  id: number;
  message: string;
  discussionId: number;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author: DiscussionAuthor;
};

export type CourseDiscussion = {
  id: number;
  title: string;
  message: string;
  status: DiscussionStatus;
  courseId: number;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author: DiscussionAuthor;
  replies: DiscussionReply[];
};

export type CourseWithDiscussions = {
  id: number;
  shortName: string;
  title: string;
  description: string;
  level: string;
  category: string;
  instructor: string;
  instructorId: number | null;
  discussions: CourseDiscussion[];
};

export type CreateDiscussionPayload = {
  courseId: number;
  title: string;
  message: string;
};

export async function fetchDiscussions(
  token: string,
): Promise<CourseWithDiscussions[]> {
  const response = await fetch(`${API_BASE_URL}/discussions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load discussions.");
  }

  return data.data.courses;
}

export async function createDiscussion(
  token: string,
  payload: CreateDiscussionPayload,
): Promise<CourseDiscussion> {
  const response = await fetch(`${API_BASE_URL}/discussions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to create discussion.");
  }

  return data.data.discussion;
}

export async function addDiscussionReply(
  token: string,
  discussionId: number,
  message: string,
): Promise<DiscussionReply> {
  const response = await fetch(
    `${API_BASE_URL}/discussions/${discussionId}/replies`,
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
    throw new Error(data.message || "Unable to add reply.");
  }

  return data.data.reply;
}

export async function updateDiscussionStatus(
  token: string,
  discussionId: number,
  status: DiscussionStatus,
): Promise<CourseDiscussion> {
  const response = await fetch(
    `${API_BASE_URL}/discussions/${discussionId}/status`,
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
    throw new Error(data.message || "Unable to update discussion status.");
  }

  return data.data.discussion;
}

export async function deleteDiscussion(token: string, discussionId: number) {
  const response = await fetch(`${API_BASE_URL}/discussions/${discussionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete discussion.");
  }

  return data;
}

export async function deleteDiscussionReply(token: string, replyId: number) {
  const response = await fetch(`${API_BASE_URL}/discussions/replies/${replyId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete reply.");
  }

  return data;
}