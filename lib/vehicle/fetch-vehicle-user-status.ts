import { apiFetch } from "@/lib/api/client";

export interface VehicleUserStatus {
  /** The user's garage entry for this vehicle and year, if any. */
  garageVehicleId: string | null;
  isFavorited: boolean;
}

async function fetchGarageVehicleId(
  vehicleModelId: string,
  year: number
): Promise<string | null> {
  const params = new URLSearchParams({ vehicleModelId, year: String(year) });
  const response = await apiFetch(`/v1/user-vehicles/status?${params}`);
  if (!response.ok) return null;

  const { userVehicleId } = (await response.json()) as {
    userVehicleId: string | null;
  };
  return userVehicleId;
}

async function fetchIsFavorited(
  vehicleModelId: string,
  year: number
): Promise<boolean> {
  const response = await apiFetch(
    `/v1/activity-logs/favorites/${vehicleModelId}?year=${year}`
  );
  if (!response.ok) return false;

  const { favorited } = (await response.json()) as { favorited: boolean };
  return favorited;
}

/**
 * For Client Components: the signed-in user's garage and favorite state for
 * a vehicle page. Falls back to "not saved" when a check fails, like the
 * page did when it rendered this server-side.
 */
export async function fetchVehicleUserStatus(
  vehicleModelId: string,
  year: number
): Promise<VehicleUserStatus> {
  const [garageVehicleId, isFavorited] = await Promise.all([
    fetchGarageVehicleId(vehicleModelId, year).catch(() => null),
    fetchIsFavorited(vehicleModelId, year).catch(() => false),
  ]);

  return { garageVehicleId, isFavorited };
}
