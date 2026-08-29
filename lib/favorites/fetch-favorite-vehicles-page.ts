import { appendCursorParams, toSearchString } from "@/lib/api/cursor";
import { fetchCursorPage } from "@/lib/lists/fetch-cursor-page";
import type { CursorPage, CursorQuery } from "@/types/cursor";
import type { FavoriteVehicle } from "@/types/favorite-vehicle";

export async function fetchFavoriteVehiclesPage(
  query: CursorQuery
): Promise<CursorPage<FavoriteVehicle>> {
  const params = new URLSearchParams();
  appendCursorParams(params, query);
  return fetchCursorPage<FavoriteVehicle>(
    `/v1/activity-logs/favorites${toSearchString(params)}`
  );
}
