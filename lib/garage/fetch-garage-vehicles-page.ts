import { appendCursorParams, toSearchString } from "@/lib/api/cursor";
import { fetchCursorPage } from "@/lib/lists/fetch-cursor-page";
import type { LookupLanguage } from "@/lib/lookup/map-lookup-language";
import type { CursorPage, CursorQuery } from "@/types/cursor";
import type { UserVehicle } from "@/types/user-vehicle";

export interface GarageVehiclesPageQuery extends CursorQuery {
  language?: LookupLanguage;
}

export async function fetchGarageVehiclesPage(
  query: GarageVehiclesPageQuery
): Promise<CursorPage<UserVehicle>> {
  const params = new URLSearchParams();
  if (query.language) {
    params.set("language", query.language);
  }
  appendCursorParams(params, query);
  return fetchCursorPage<UserVehicle>(
    `/v1/user-vehicles${toSearchString(params)}`
  );
}
