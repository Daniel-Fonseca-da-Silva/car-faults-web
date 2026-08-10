import { serverApiFetch } from "@/lib/api/server-client";
import type { LookupLanguage } from "@/lib/lookup/map-lookup-language";
import type { UserProfile } from "@/types/user";
import type { UserStats } from "@/types/user-stats";
import type { UserVehicle, UserVehicleDetail } from "@/types/user-vehicle";

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const response = await serverApiFetch("/v1/users/me");

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as UserProfile;
  } catch {
    return null;
  }
}

export async function getCurrentUserStats(): Promise<UserStats> {
  const response = await serverApiFetch("/v1/users/me/stats");

  if (!response.ok) {
    throw new Error(`Failed to load current user stats: ${response.status}`);
  }

  return (await response.json()) as UserStats;
}

export async function getCurrentUserVehicles(
  language?: LookupLanguage
): Promise<UserVehicle[]> {
  const query = language ? `?language=${language}` : "";
  const response = await serverApiFetch(`/v1/user-vehicles${query}`);

  if (!response.ok) {
    throw new Error(`Failed to load current user vehicles: ${response.status}`);
  }

  return (await response.json()) as UserVehicle[];
}

export async function getCurrentUserVehicle(
  id: string,
  language?: LookupLanguage
): Promise<UserVehicleDetail | null> {
  const query = language ? `?language=${language}` : "";
  const response = await serverApiFetch(`/v1/user-vehicles/${id}${query}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load current user vehicle: ${response.status}`);
  }

  return (await response.json()) as UserVehicleDetail;
}

export interface CreateUserVehicleInput {
  vehicleModelId: string;
  year: number;
}

export class UserVehicleConflictError extends Error {
  constructor() {
    super("Vehicle already in garage");
    this.name = "UserVehicleConflictError";
  }
}

export async function createCurrentUserVehicle(
  input: CreateUserVehicleInput
): Promise<UserVehicle> {
  const response = await serverApiFetch("/v1/user-vehicles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (response.status === 409) {
    throw new UserVehicleConflictError();
  }

  if (!response.ok) {
    throw new Error(`Failed to add vehicle to garage: ${response.status}`);
  }

  return (await response.json()) as UserVehicle;
}

export async function deleteCurrentUserVehicle(id: string): Promise<void> {
  const response = await serverApiFetch(`/v1/user-vehicles/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete current user vehicle: ${response.status}`);
  }
}
