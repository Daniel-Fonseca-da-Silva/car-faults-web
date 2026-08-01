import { serverApiFetch } from "@/lib/api/server-client";

const VEHICLE_FAVORITE_TYPE = "vehicle_favorite";

export interface FavoriteStatus {
  vehicleModelId: string;
  favorited: boolean;
}

export async function favoriteVehicle(vehicleModelId: string): Promise<void> {
  const response = await serverApiFetch("/v1/activity-logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: VEHICLE_FAVORITE_TYPE,
      resourceId: vehicleModelId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to favorite vehicle: ${response.status}`);
  }
}

export async function unfavoriteVehicle(
  vehicleModelId: string
): Promise<void> {
  const response = await serverApiFetch(
    `/v1/activity-logs/favorites/${vehicleModelId}`,
    { method: "DELETE" }
  );

  if (!response.ok) {
    throw new Error(`Failed to unfavorite vehicle: ${response.status}`);
  }
}

export async function getVehicleFavoriteStatus(
  vehicleModelId: string
): Promise<FavoriteStatus> {
  const response = await serverApiFetch(
    `/v1/activity-logs/favorites/${vehicleModelId}`
  );

  if (!response.ok) {
    throw new Error(`Failed to load favorite status: ${response.status}`);
  }

  return (await response.json()) as FavoriteStatus;
}
