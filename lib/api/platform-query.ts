import { appendCursorParams, toSearchString } from "@/lib/api/cursor";
import { mapTopFault, type TopFaultDto } from "@/lib/api/platform-map";
import type { LookupLanguage } from "@/lib/lookup/map-lookup-language";
import type { CursorPage, CursorQuery } from "@/types/cursor";
import type { TopFaultEntry } from "@/types/vehicle";

export type PlatformVehiclesQuery = CursorQuery;

export interface PlatformFaultsQuery extends CursorQuery {
  locale: LookupLanguage;
  brand?: string;
  model?: string;
  year?: number;
  fuelType?: string;
  doors?: number;
  engine?: string;
}

export type PlatformFaultsPage = CursorPage<TopFaultEntry>;

export function buildPlatformFaultsSearch(query: PlatformFaultsQuery): string {
  const params = new URLSearchParams({ locale: query.locale });
  appendCursorParams(params, query);
  if (query.brand) params.set("brand", query.brand);
  if (query.model) params.set("model", query.model);
  if (query.year != null) params.set("year", String(query.year));
  if (query.fuelType) params.set("fuelType", query.fuelType);
  if (query.doors != null) params.set("doors", String(query.doors));
  if (query.engine) params.set("engine", query.engine);
  return toSearchString(params);
}

export function buildPlatformVehiclesSearch(
  query: PlatformVehiclesQuery = {}
): string {
  const params = new URLSearchParams();
  appendCursorParams(params, query);
  return toSearchString(params);
}

export function mapPlatformFaultsPage(dto: {
  items: TopFaultDto[];
  nextCursor: string | null;
}): PlatformFaultsPage {
  return {
    items: dto.items.map(mapTopFault),
    nextCursor: dto.nextCursor,
  };
}
