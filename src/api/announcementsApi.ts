const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export type AnnouncementTarget = "ALL" | "STUDENTS" | "INSTRUCTORS" | "COURSE";

export type AnnouncementAuthor = {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
};

export type AnnouncementCourse = {
  id: number;
  shortName: string;
  title: string;
  category: string;
  level: string;
};

export type Announcement = {
  id: number;
  title: string;
  message: string;
  target: AnnouncementTarget;
  courseId: number | null;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author: AnnouncementAuthor;
  course: AnnouncementCourse | null;
};

export type AnnouncementPayload = {
  title: string;
  message: string;
  target: AnnouncementTarget;
  courseId: number | null;
};

export async function fetchAnnouncements(token: string): Promise<Announcement[]> {
  const response = await fetch(`${API_BASE_URL}/announcements`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load announcements.");
  }

  return data.data.announcements;
}

export async function createAnnouncement(
  token: string,
  payload: AnnouncementPayload,
): Promise<Announcement> {
  const response = await fetch(`${API_BASE_URL}/announcements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to create announcement.");
  }

  return data.data.announcement;
}

export async function updateAnnouncement(
  token: string,
  announcementId: number,
  payload: AnnouncementPayload,
): Promise<Announcement> {
  const response = await fetch(
    `${API_BASE_URL}/announcements/${announcementId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update announcement.");
  }

  return data.data.announcement;
}

export async function deleteAnnouncement(
  token: string,
  announcementId: number,
) {
  const response = await fetch(
    `${API_BASE_URL}/announcements/${announcementId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete announcement.");
  }

  return data;
}