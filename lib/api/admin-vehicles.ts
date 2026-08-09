import { apiFetch } from "@/lib/api/client";
import type { AdminVehicleModel } from "@/types/admin";
import type { LookupFuelType, VehicleTechSpecs } from "@/types/lookup";

export interface AdminVehicleModelInput {
  brand: string;
  model: string;
  name?: string | null;
  yearFrom: number;
  yearTo?: number | null;
  engine: string;
  doors?: number | null;
  fuelType?: LookupFuelType | null;
  imageUrl?: string | null;
  techSpecs?: VehicleTechSpecs | null;
}

export async function createAdminVehicleModel(
  input: AdminVehicleModelInput
): Promise<AdminVehicleModel> {
  const response = await apiFetch("/v1/admin/vehicle-models", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to create vehicle model: ${response.status}`);
  }

  return (await response.json()) as AdminVehicleModel;
}

export async function updateAdminVehicleModel(
  id: string,
  input: Partial<AdminVehicleModelInput>
): Promise<AdminVehicleModel> {
  const response = await apiFetch(`/v1/admin/vehicle-models/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to update vehicle model: ${response.status}`);
  }

  return (await response.json()) as AdminVehicleModel;
}

export async function deleteAdminVehicleModel(id: string): Promise<void> {
  const response = await apiFetch(`/v1/admin/vehicle-models/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete vehicle model: ${response.status}`);
  }
}
