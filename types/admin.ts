import type {
  FixSource,
  IssueSeverity,
  LookupFuelType,
  VehicleTechSpecs,
} from "@/types/lookup";

export type AdminIssueLocale = "pt-PT" | "en-GB" | "es-ES";

export interface AdminVehicleModel {
  id: string;
  brand: string;
  model: string;
  name: string | null;
  yearFrom: number;
  yearTo: number | null;
  engine: string;
  doors: number | null;
  fuelType: LookupFuelType | null;
  imageUrl: string | null;
  techSpecs: VehicleTechSpecs | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminVehicleModelList {
  items: AdminVehicleModel[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminKnownIssue {
  id: string;
  vehicleModelId: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  locale: AdminIssueLocale;
  typicalKm: number | null;
  sources: string[] | null;
  aiGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminVehicleModelDetail {
  vehicle: AdminVehicleModel;
  knownIssues: AdminKnownIssue[];
}

export interface AdminFix {
  id: string;
  knownIssueId: string;
  userId: string | null;
  summary: string;
  steps: string;
  estimatedCostEur: string | null;
  source: FixSource;
  createdAt: string;
  updatedAt: string;
}

export interface AdminKnownIssueDetail extends AdminKnownIssue {
  fixes: AdminFix[];
}
