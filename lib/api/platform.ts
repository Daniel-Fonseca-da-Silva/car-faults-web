import { mapPlatformFaultsPage } from "@/lib/api/platform-query";
import { serverApiFetch } from "@/lib/api/server-client";
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
  yearFrom: number;
  engine: string;
  fuelType: string;
  doors?: number;
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
    const response = await serverApiFetch("/v1/platform/stats");

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
    const response = await serverApiFetch(
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

export async function getPlatformVehicles(
  query: PlatformVehiclesQuery = {}
): Promise<PlatformVehiclesPage> {
  try {
    const response = await serverApiFetch(
      `/v1/platform/vehicles${buildPlatformVehiclesSearch(query)}`
    );

    if (!response.ok) {
      return EMPTY_CURSOR_PAGE;
    }

    return (await response.json()) as PlatformVehiclesPage;
  } catch {
    return EMPTY_CURSOR_PAGE;
  }
}

export async function getDatabaseStatus(): Promise<boolean> {
  try {
    const response = await serverApiFetch("/v1/platform/stats");
    return response.ok;
  } catch {
    return false;
  }
}
