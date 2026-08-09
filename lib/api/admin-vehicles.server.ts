import { serverApiFetch } from "@/lib/api/server-client";
import type {
  AdminVehicleModelDetail,
  AdminVehicleModelList,
} from "@/types/admin";

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
