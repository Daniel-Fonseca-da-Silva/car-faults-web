import type { TopFaultEntry } from "@/types/vehicle";

export interface TopFaultDto {
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

export function mapTopFault(dto: TopFaultDto): TopFaultEntry {
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
