import type { KnownIssue, LookupFuelType } from "@/types/lookup";

export interface UserVehicle {
  id: string;
  vehicleModelId: string | null;
  brand: string;
  model: string;
  year: number;
  engine: string;
  name: string | null;
  doors: number | null;
  fuelType: LookupFuelType | null;
  imageUrl: string | null;
  knownIssuesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserVehicleDetail extends UserVehicle {
  knownIssues: KnownIssue[];
}
