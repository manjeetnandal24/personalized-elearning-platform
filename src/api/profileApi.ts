const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export type UpdatedProfileUser = {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  createdAt: string;
  updatedAt: string;
};

export async function updateProfileName(
  name: string,
  token: string,
): Promise<UpdatedProfileUser> {
  const response = await fetch(`${API_BASE_URL}/profile/name`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update profile name.");
  }

  return data.data.user;
}