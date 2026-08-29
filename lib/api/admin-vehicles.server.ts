import {
  buildVehicleModelsQuery,
  type AdminVehicleModelsQuery,
} from "@/lib/api/admin-vehicles-query";
import { serverApiFetch } from "@/lib/api/server-client";
import type {
  AdminVehicleModelDetail,
  AdminVehicleModelList,
} from "@/types/admin";

export type { AdminVehicleModelsQuery } from "@/lib/api/admin-vehicles-query";
export { buildVehicleModelsQuery } from "@/lib/api/admin-vehicles-query";

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
