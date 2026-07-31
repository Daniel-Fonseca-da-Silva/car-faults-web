import { slugify } from "@/lib/utils";

export interface BuildLookupHrefParams {
  brand: string;
  model: string;
  year: number;
  engine: string;
  fuelType: string;
  doors?: number | null;
}

export function buildLookupHref(params: BuildLookupHrefParams): string {
  const path = `/defects/${slugify(params.brand)}/${slugify(params.model)}/${params.year}`;

  const query = new URLSearchParams({
    brand: params.brand,
    model: params.model,
    engine: params.engine,
    fuelType: params.fuelType,
  });
  if (params.doors != null) {
    query.set("doors", String(params.doors));
  }

  return `${path}?${query.toString()}`;
}
