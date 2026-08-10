import { serverApiFetch } from "@/lib/api/server-client";
import type { LookupLanguage } from "@/lib/lookup/map-lookup-language";
import type { TopFaultEntry } from "@/types/vehicle";

export interface PlatformStats {
  reportsCount: number;
  vehiclesCount: number;
  faultsCount: number;
}

interface TopFaultDto {
  id: string;
  faultTitle: string;
  severity: TopFaultEntry["severity"];
  reportCount: number;
  vehicle: {
    brand: string;
    model: string;
    yearFrom: number;
    engine: string;
    fuelType?: string;
    doors?: number;
  };
}

interface PlatformFaultsResponseDto {
  items: TopFaultDto[];
  total: number;
  page: number;
  limit: number;
}

interface PlatformVehicleItemDto {
  brand: string;
  model: string;
  yearFrom: number;
  engine: string;
  fuelType: string;
  doors?: number;
}

export interface PlatformVehiclesQuery {
  page?: number;
  limit?: number;
}

export interface PlatformVehiclesPage {
  items: PlatformVehicleItemDto[];
  total: number;
  page: number;
  limit: number;
}

export interface PlatformFaultsQuery {
  locale: LookupLanguage;
  page?: number;
  limit?: number;
  brand?: string;
  model?: string;
  year?: number;
  fuelType?: string;
  doors?: number;
  engine?: string;
}

export interface PlatformFaultsPage {
  items: TopFaultEntry[];
  total: number;
  page: number;
  limit: number;
}

const EMPTY_PLATFORM_STATS: PlatformStats = {
  reportsCount: 0,
  vehiclesCount: 0,
  faultsCount: 0,
};

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
  const params = new URLSearchParams({ locale: query.locale });
  if (query.page != null) params.set("page", String(query.page));
  if (query.limit != null) params.set("limit", String(query.limit));
  if (query.brand) params.set("brand", query.brand);
  if (query.model) params.set("model", query.model);
  if (query.year != null) params.set("year", String(query.year));
  if (query.fuelType) params.set("fuelType", query.fuelType);
  if (query.doors != null) params.set("doors", String(query.doors));
  if (query.engine) params.set("engine", query.engine);

  try {
    const response = await serverApiFetch(
      `/v1/platform/faults?${params.toString()}`
    );

    if (!response.ok) {
      return {
        items: [],
        total: 0,
        page: query.page ?? 1,
        limit: query.limit ?? 9,
      };
    }

    const { items, total, page, limit } =
      (await response.json()) as PlatformFaultsResponseDto;
    return { items: items.map(mapTopFault), total, page, limit };
  } catch {
    return {
      items: [],
      total: 0,
      page: query.page ?? 1,
      limit: query.limit ?? 9,
    };
  }
}

export async function getPlatformVehicles(
  query: PlatformVehiclesQuery = {}
): Promise<PlatformVehiclesPage> {
  const params = new URLSearchParams();
  if (query.page != null) params.set("page", String(query.page));
  if (query.limit != null) params.set("limit", String(query.limit));

  try {
    const response = await serverApiFetch(
      `/v1/platform/vehicles?${params.toString()}`
    );

    if (!response.ok) {
      return {
        items: [],
        total: 0,
        page: query.page ?? 1,
        limit: query.limit ?? 200,
      };
    }

    return (await response.json()) as PlatformVehiclesPage;
  } catch {
    return {
      items: [],
      total: 0,
      page: query.page ?? 1,
      limit: query.limit ?? 200,
    };
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

function mapTopFault(dto: TopFaultDto): TopFaultEntry {
  return {
    id: dto.id,
    vehicle: {
      make: dto.vehicle.brand,
      model: dto.vehicle.model,
      year: dto.vehicle.yearFrom,
      engine: dto.vehicle.engine,
      fuelType: dto.vehicle.fuelType,
      doors: dto.vehicle.doors,
    },
    faultTitle: dto.faultTitle,
    severity: dto.severity,
    reportCount: dto.reportCount,
  };
}
