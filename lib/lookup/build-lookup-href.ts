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
  const path = `/defects/${slugify(params.brand)}/${slugify(params.model)}/${params.year}/${params.fuelType}/${slugify(params.engine)}`;

  if (params.doors == null) {
    return path;
  }

  return `${path}?doors=${params.doors}`;
}
