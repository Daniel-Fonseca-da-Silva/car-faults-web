export type FuelType = "petrol" | "diesel" | "hybrid" | "electric";

export type FaultSeverity = "low" | "medium" | "high" | "critical";

export interface EngineOption {
  code: string;
  label: string;
  fuel: FuelType;
  displacementLitres: number;
}

export interface CostRangeEur {
  min: number;
  max: number;
}

export interface VehicleFault {
  id: string;
  title: string;
  description: string;
  severity: FaultSeverity;
  reportCount: number;
  typicalCost: CostRangeEur;
}

export interface Vehicle {
  makeSlug: string;
  make: string;
  modelSlug: string;
  model: string;
  year: number;
  doors: number[];
  engines: EngineOption[];
  reportCount: number;
  faults: VehicleFault[];
}

export interface TopFaultEntry {
  id: string;
  vehicle: {
    makeSlug: string;
    make: string;
    modelSlug: string;
    model: string;
    year: number;
  };
  faultTitle: string;
  severity: FaultSeverity;
  reportCount: number;
}
