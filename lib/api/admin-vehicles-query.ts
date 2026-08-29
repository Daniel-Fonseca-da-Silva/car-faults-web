import { appendCursorParams, toSearchString } from "@/lib/api/cursor";
import type { CursorQuery } from "@/types/cursor";

export interface AdminVehicleModelsQuery extends CursorQuery {
  brand?: string;
  model?: string;
}

export function buildVehicleModelsQuery(
  query: AdminVehicleModelsQuery
): string {
  const params = new URLSearchParams();
  appendCursorParams(params, query);
  if (query.brand) params.set("brand", query.brand);
  if (query.model) params.set("model", query.model);
  return toSearchString(params);
}
