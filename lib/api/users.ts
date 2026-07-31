import { serverApiFetch } from "@/lib/api/server-client";
import type { UserProfile } from "@/types/user";
import type { UserStats } from "@/types/user-stats";
import type { UserVehicle } from "@/types/user-vehicle";

export async function getCurrentUser(): Promise<UserProfile | null> {
  const response = await serverApiFetch("/v1/users/me");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load current user: ${response.status}`);
  }

  return (await response.json()) as UserProfile;
}

export async function getCurrentUserStats(): Promise<UserStats> {
  const response = await serverApiFetch("/v1/users/me/stats");

  if (!response.ok) {
    throw new Error(`Failed to load current user stats: ${response.status}`);
  }

  return (await response.json()) as UserStats;
}

export async function getCurrentUserVehicles(): Promise<UserVehicle[]> {
  const response = await serverApiFetch("/v1/user-vehicles");

  if (!response.ok) {
    throw new Error(`Failed to load current user vehicles: ${response.status}`);
  }

  return (await response.json()) as UserVehicle[];
}
