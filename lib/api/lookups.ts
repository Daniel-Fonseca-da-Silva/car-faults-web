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

  try {
    const response = await serverApiFetch(`/v1/lookups?${query.toString()}`);

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as LookupResponse;
  } catch {
    return null;
  }
}

export interface GetVehicleLookupByPathParams {
  make: string;
  model: string;
  year: number;
  fuelType: string;
  engine: string;
  doors?: number;
  language?: LookupLanguage;
}

export async function getVehicleLookupByPath(
  params: GetVehicleLookupByPathParams
): Promise<LookupResponse | null> {
  const query = new URLSearchParams({
    make: params.make,
    model: params.model,
    year: String(params.year),
    fuelType: params.fuelType,
    engine: params.engine,
  });
  if (params.doors != null) query.set("doors", String(params.doors));
  if (params.language) query.set("language", params.language);

  try {
    const response = await serverApiFetch(
      `/v1/lookups/by-path?${query.toString()}`
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as LookupResponse;
  } catch {
    return null;
  }
}
