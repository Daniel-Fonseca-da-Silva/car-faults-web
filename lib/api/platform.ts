import { getApiBaseUrl } from "@/lib/api/config";
import { mapPlatformFaultsPage } from "@/lib/api/platform-query";
import { publicApiFetch } from "@/lib/api/public-client";
import type { TopFaultDto } from "@/lib/api/platform-map";
import type { CursorPage } from "@/types/cursor";

import {
  buildPlatformFaultsSearch,
  buildPlatformVehiclesSearch,
  type PlatformFaultsPage,
  type PlatformFaultsQuery,
  type PlatformVehiclesQuery,
} from "./platform-query";

export type {
  PlatformFaultsPage,
  PlatformFaultsQuery,
  PlatformVehiclesQuery,
} from "./platform-query";

export interface PlatformStats {
  reportsCount: number;
  vehiclesCount: number;
  faultsCount: number;
}

interface PlatformVehicleItemDto {
  brand: string;
  model: string;
  name?: string;
  yearFrom: number;
  engine: string;
  fuelType: string;
  doors?: number;
  /** Locales with known issues; absent on API versions that predate the field. */
  locales?: string[];
  /**
   * Latest change to the vehicle, its known issues or their fixes (ISO 8601).
   * Absent on API versions that predate the field.
   */
  updatedAt?: string;
}

export type PlatformVehiclesPage = CursorPage<PlatformVehicleItemDto>;

const EMPTY_PLATFORM_STATS: PlatformStats = {
  reportsCount: 0,
  vehiclesCount: 0,
  faultsCount: 0,
};

const EMPTY_CURSOR_PAGE = { items: [], nextCursor: null };

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const response = await publicApiFetch("/v1/platform/stats");

    if (!response.ok) {
      return EMPTY_PLATFORM_STATS;
    }

    return (await response.json()) as PlatformStats;
  } catch {
    return EMPTY_PLATFORM_STATS;
  }
}

export async function getPlatformFaults(
  query: PlatformFaultsQuery
): Promise<PlatformFaultsPage> {
  try {
    const response = await publicApiFetch(
      `/v1/platform/faults${buildPlatformFaultsSearch(query)}`
    );

    if (!response.ok) {
      return EMPTY_CURSOR_PAGE;
    }

    return mapPlatformFaultsPage(
      (await response.json()) as {
        items: TopFaultDto[];
        nextCursor: string | null;
      }
    );
  } catch {
    return EMPTY_CURSOR_PAGE;
  }
}

/**
 * Rejects when the API fails. The catalog decides which hub pages exist, so
 * an empty fallback would turn an outage (or a failure halfway through
 * paging) into 404s for every brand and model.
 */
export async function getPlatformVehicles(
  query: PlatformVehiclesQuery = {}
): Promise<PlatformVehiclesPage> {
  const response = await publicApiFetch(
    `/v1/platform/vehicles${buildPlatformVehiclesSearch(query)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to load platform vehicles: ${response.status}`);
  }

  return (await response.json()) as PlatformVehiclesPage;
}

/** How long the home page's "database up" indicator may lag behind. */
export const DATABASE_STATUS_REVALIDATE_SECONDS = 60;

/**
 * Checked through the API's health endpoint (which pings the database) and
 * cached briefly, so the home page that shows it can still be served from
 * the cache instead of calling the API on every visit.
 */
export async function getDatabaseStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/v1/health`, {
      next: { revalidate: DATABASE_STATUS_REVALIDATE_SECONDS },
    });
    return response.ok;
  } catch {
    return false;
  }
}
