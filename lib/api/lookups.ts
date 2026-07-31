import { serverApiFetch } from "@/lib/api/server-client";
import type { LookupLanguage } from "@/lib/lookup/map-lookup-language";
import type { LookupResponse } from "@/types/lookup";

export interface GetVehicleLookupParams {
  brand: string;
  model: string;
  year: number;
  engine: string;
  fuelType: string;
  doors?: number;
  language?: LookupLanguage;
}

export async function getVehicleLookup(
  params: GetVehicleLookupParams
): Promise<LookupResponse | null> {
  const query = new URLSearchParams({
    brand: params.brand,
    model: params.model,
    year: String(params.year),
    engine: params.engine,
    fuelType: params.fuelType,
  });
  if (params.doors != null) query.set("doors", String(params.doors));
  if (params.language) query.set("language", params.language);

  const response = await serverApiFetch(`/v1/lookups?${query.toString()}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load vehicle lookup: ${response.status}`);
  }

  return (await response.json()) as LookupResponse;
}
