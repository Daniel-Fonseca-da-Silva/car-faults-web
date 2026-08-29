import { appendCursorParams, toSearchString } from "@/lib/api/cursor";
import { serverApiFetch } from "@/lib/api/server-client";
import type { CursorPage, CursorQuery } from "@/types/cursor";
import type { FavoriteVehicle } from "@/types/favorite-vehicle";

const VEHICLE_FAVORITE_TYPE = "vehicle_favorite";

export interface FavoriteStatus {
  vehicleModelId: string;
  favorited: boolean;
}

export async function favoriteVehicle(
  vehicleModelId: string,
  year: number
): Promise<void> {
  const response = await serverApiFetch("/v1/activity-logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: VEHICLE_FAVORITE_TYPE,
      resourceId: vehicleModelId,
      year,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to favorite vehicle: ${response.status}`);
  }
}

export async function unfavoriteVehicle(
  vehicleModelId: string,
  year: number
): Promise<void> {
  const response = await serverApiFetch(
    `/v1/activity-logs/favorites/${vehicleModelId}?year=${year}`,
    { method: "DELETE" }
  );

  if (!response.ok) {
    throw new Error(`Failed to unfavorite vehicle: ${response.status}`);
  }
}

export async function getVehicleFavoriteStatus(
  vehicleModelId: string,
  year: number
): Promise<FavoriteStatus> {
  try {
    const response = await serverApiFetch(
      `/v1/activity-logs/favorites/${vehicleModelId}?year=${year}`
    );

    if (!response.ok) {
      return { vehicleModelId, favorited: false };
    }

    return (await response.json()) as FavoriteStatus;
  } catch {
    return { vehicleModelId, favorited: false };
  }
}

export async function getFavoriteVehicles(
  query: CursorQuery = {}
): Promise<CursorPage<FavoriteVehicle>> {
  const params = new URLSearchParams();
  appendCursorParams(params, query);
  const response = await serverApiFetch(
    `/v1/activity-logs/favorites${toSearchString(params)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to load favorite vehicles: ${response.status}`);
  }

  return (await response.json()) as CursorPage<FavoriteVehicle>;
}
