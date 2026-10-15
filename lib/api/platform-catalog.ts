import { cache } from "react";

import { locales as allLocales, type Locale } from "@/i18n/locales";
import { getPlatformVehicles } from "@/lib/api/platform";
import { slugify } from "@/lib/utils";

const CATALOG_PAGE_LIMIT = 200;

export interface CatalogVehicle {
  brand: string;
  model: string;
  name?: string;
  yearFrom: number;
  engine: string;
  fuelType: string;
  doors?: number;
  /**
   * Locales with known issues. Vehicle pages only show issues in their own
   * locale, so these are the only locales where the page has content.
   * Absent on API versions that predate the field.
   */
  locales?: string[];
}

export interface CatalogSlugName {
  slug: string;
  name: string;
}

/**
 * The whole catalog. Hub and vehicle pages call this several times per
 * render, so it is memoized per request on top of the fetch data cache.
 */
export const fetchAllPlatformVehicles = cache(
  async (): Promise<CatalogVehicle[]> => {
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
);

/** Treats a vehicle without `locales` (older API) as having content everywhere. */
export function hasContentInLocale(
  vehicle: CatalogVehicle,
  locale: string
): boolean {
  return !vehicle.locales || vehicle.locales.includes(locale);
}

/** Site locales where at least one of the given vehicles has content, in site order. */
export function getContentLocales(vehicles: CatalogVehicle[]): Locale[] {
  return allLocales.filter((locale) =>
    vehicles.some((vehicle) => hasContentInLocale(vehicle, locale))
  );
}

export async function getCatalogBrandVehicles(
  makeSlug: string
): Promise<CatalogVehicle[]> {
  const vehicles = await fetchAllPlatformVehicles();
  return vehicles.filter((vehicle) => slugify(vehicle.brand) === makeSlug);
}

export async function findCatalogVehicle(criteria: {
  makeSlug: string;
  modelSlug: string;
  yearFrom: number;
  fuelType: string;
  engineSlug: string;
}): Promise<CatalogVehicle | null> {
  const vehicles = await getCatalogVariants(
    criteria.makeSlug,
    criteria.modelSlug
  );
  return (
    vehicles.find(
      (vehicle) =>
        vehicle.yearFrom === criteria.yearFrom &&
        vehicle.fuelType === criteria.fuelType &&
        slugify(vehicle.engine) === criteria.engineSlug
    ) ?? null
  );
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

/** With `locale`, only models that have a vehicle with content in that locale. */
export async function getCatalogModels(
  makeSlug: string,
  locale?: string
): Promise<CatalogSlugName[]> {
  const vehicles = await fetchAllPlatformVehicles();
  const modelBySlug = new Map<string, string>();

  for (const vehicle of vehicles) {
    if (
      slugify(vehicle.brand) === makeSlug &&
      (!locale || hasContentInLocale(vehicle, locale))
    ) {
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

/** With `locale`, only variants with content in that locale. */
export async function getCatalogVariants(
  makeSlug: string,
  modelSlug: string,
  locale?: string
): Promise<CatalogVehicle[]> {
  const vehicles = await fetchAllPlatformVehicles();
  return vehicles.filter(
    (vehicle) =>
      slugify(vehicle.brand) === makeSlug &&
      slugify(vehicle.model) === modelSlug &&
      (!locale || hasContentInLocale(vehicle, locale))
  );
}
