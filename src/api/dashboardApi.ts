import type { DashboardData, DashboardResponse } from "../types/dashboard";

const API_BASE_URL = "http://localhost:5000/api";

async function getErrorMessage(response: Response) {
  try {
    const data: { message?: string } = await response.json();
    return data.message || "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}

export async function fetchDashboardData(
  token: string,
): Promise<DashboardData> {
  const response = await fetch(`${API_BASE_URL}/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const result: DashboardResponse = await response.json();

  return result.data;
}