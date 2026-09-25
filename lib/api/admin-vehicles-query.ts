import { appendCursorParams, toSearchString } from "@/lib/api/cursor";
import type { CursorQuery } from "@/types/cursor";

export type AdminVehicleImageFilter = "true" | "false";

export interface AdminVehicleModelsQuery extends CursorQuery {
  brand?: string;
  model?: string;
  hasImage?: AdminVehicleImageFilter;
}

export function buildVehicleModelsQuery(
  query: AdminVehicleModelsQuery
): string {
  const params = new URLSearchParams();
  appendCursorParams(params, query);
  if (query.brand) params.set("brand", query.brand);
  if (query.model) params.set("model", query.model);
  if (query.hasImage) params.set("hasImage", query.hasImage);
  return toSearchString(params);
}
