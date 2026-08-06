import { apiFetch } from "@/lib/api/client";
import { serverApiFetch } from "@/lib/api/server-client";
import type {
  AdminVehicleModel,
  AdminVehicleModelDetail,
  AdminVehicleModelList,
} from "@/types/admin";
import type { LookupFuelType, VehicleTechSpecs } from "@/types/lookup";

export interface AdminVehicleModelsQuery {
  page?: number;
  limit?: number;
  brand?: string;
  model?: string;
}

function buildVehicleModelsQuery(query: AdminVehicleModelsQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.brand) params.set("brand", query.brand);
  if (query.model) params.set("model", query.model);
  const search = params.toString();
  return search ? `?${search}` : "";
}

export async function getAdminVehicleModels(
  query: AdminVehicleModelsQuery = {}
): Promise<AdminVehicleModelList> {
  const response = await serverApiFetch(
    `/v1/admin/vehicle-models${buildVehicleModelsQuery(query)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to load vehicle models: ${response.status}`);
  }

  return (await response.json()) as AdminVehicleModelList;
}

export async function getAdminVehicleModel(
  id: string,
  locale?: string
): Promise<AdminVehicleModelDetail | null> {
  const query = locale ? `?locale=${locale}` : "";
  const response = await serverApiFetch(
    `/v1/admin/vehicle-models/${id}${query}`
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load vehicle model: ${response.status}`);
  }

  return (await response.json()) as AdminVehicleModelDetail;
}

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
