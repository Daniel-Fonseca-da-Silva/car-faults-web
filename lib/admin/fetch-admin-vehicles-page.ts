import {
  buildVehicleModelsQuery,
  type AdminVehicleModelsQuery,
} from "@/lib/api/admin-vehicles-query";
import { fetchCursorPage } from "@/lib/lists/fetch-cursor-page";
import type { AdminVehicleModel } from "@/types/admin";
import type { CursorPage } from "@/types/cursor";

export async function fetchAdminVehiclesPage(
  query: AdminVehicleModelsQuery
): Promise<CursorPage<AdminVehicleModel>> {
  return fetchCursorPage<AdminVehicleModel>(
    `/v1/admin/vehicle-models${buildVehicleModelsQuery(query)}`
  );
}
