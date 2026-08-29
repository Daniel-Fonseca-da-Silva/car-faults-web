import { getPlatformVehicles } from "@/lib/api/platform";
import { slugify } from "@/lib/utils";

const CATALOG_PAGE_LIMIT = 200;

export interface CatalogVehicle {
  brand: string;
  model: string;
  yearFrom: number;
  engine: string;
  fuelType: string;
  doors?: number;
}

export interface CatalogSlugName {
  slug: string;
  name: string;
}

export async function fetchAllPlatformVehicles(): Promise<CatalogVehicle[]> {
  const items: CatalogVehicle[] = [];
  let cursor: string | null = null;

  do {
    const result = await getPlatformVehicles({
      cursor,
      limit: CATALOG_PAGE_LIMIT,
    });
    items.push(...result.items);
    cursor = result.nextCursor;
  } while (cursor);

  return items;
}

export async function getCatalogBrands(): Promise<CatalogSlugName[]> {
  const vehicles = await fetchAllPlatformVehicles();
  const brandBySlug = new Map<string, string>();

  for (const vehicle of vehicles) {
    brandBySlug.set(slugify(vehicle.brand), vehicle.brand);
  }

  return Array.from(brandBySlug, ([slug, name]) => ({ slug, name }));
}

export async function getCatalogBrand(
  makeSlug: string
): Promise<CatalogSlugName | null> {
  const brands = await getCatalogBrands();
  return brands.find((brand) => brand.slug === makeSlug) ?? null;
}

export async function getCatalogModels(
  makeSlug: string
): Promise<CatalogSlugName[]> {
  const vehicles = await fetchAllPlatformVehicles();
  const modelBySlug = new Map<string, string>();

  for (const vehicle of vehicles) {
    if (slugify(vehicle.brand) === makeSlug) {
      modelBySlug.set(slugify(vehicle.model), vehicle.model);
    }
  }

  return Array.from(modelBySlug, ([slug, name]) => ({ slug, name }));
}

export async function getCatalogModel(
  makeSlug: string,
  modelSlug: string
): Promise<CatalogSlugName | null> {
  const models = await getCatalogModels(makeSlug);
  return models.find((model) => model.slug === modelSlug) ?? null;
}

export async function getCatalogVariants(
  makeSlug: string,
  modelSlug: string
): Promise<CatalogVehicle[]> {
  const vehicles = await fetchAllPlatformVehicles();
  return vehicles.filter(
    (vehicle) =>
      slugify(vehicle.brand) === makeSlug &&
      slugify(vehicle.model) === modelSlug
  );
}
