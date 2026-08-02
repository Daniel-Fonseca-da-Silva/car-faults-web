import { serverApiFetch } from "@/lib/api/server-client";
import type { LookupLanguage } from "@/lib/lookup/map-lookup-language";
import { slugify } from "@/lib/utils";
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

interface TopFaultsResponseDto {
  items: TopFaultDto[];
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const response = await serverApiFetch("/v1/platform/stats");

  if (!response.ok) {
    throw new Error(`Failed to load platform stats: ${response.status}`);
  }

  return (await response.json()) as PlatformStats;
}

export async function getTopFaults(
  locale: LookupLanguage,
  limit?: number
): Promise<TopFaultEntry[]> {
  const query = new URLSearchParams({ locale });
  if (limit != null) query.set("limit", String(limit));

  const response = await serverApiFetch(
    `/v1/platform/top-faults?${query.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to load top faults: ${response.status}`);
  }

  const { items } = (await response.json()) as TopFaultsResponseDto;
  return items.map(mapTopFault);
}

function mapTopFault(dto: TopFaultDto): TopFaultEntry {
  return {
    id: dto.id,
    vehicle: {
      makeSlug: slugify(dto.vehicle.brand),
      make: dto.vehicle.brand,
      modelSlug: slugify(dto.vehicle.model),
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
