import type { LookupFuelType } from "@/types/lookup";

export interface FavoriteVehicle {
  vehicleModelId: string;
  brand: string;
  model: string;
  engine: string;
  fuelType: LookupFuelType | null;
  doors: number | null;
  imageUrl: string | null;
  year: number;
}
