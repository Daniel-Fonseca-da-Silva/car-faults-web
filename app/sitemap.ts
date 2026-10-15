import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import {
  type CatalogVehicle,
  fetchAllPlatformVehicles,
  getContentLocales,
} from "@/lib/api/platform-catalog";
import { getSiteUrl } from "@/lib/seo/get-site-url";
import { slugify } from "@/lib/utils";

const baseUrl = getSiteUrl();

// Rendered per request so a build or revalidation that can't reach the API
// never freezes an empty catalog into the sitemap. The catalog itself still
// comes from the fetch data cache (see publicApiFetch), so this stays cheap.
export const revalidate = 0;

const STATIC_PATHS: {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  /** Lists catalog content, so it changes whenever any vehicle does. */
  showsCatalog?: boolean;
}[] = [
  { path: "", priority: 1, changeFrequency: "daily", showsCatalog: true },
  {
    path: "/defects",
    priority: 0.9,
    changeFrequency: "daily",
    showsCatalog: true,
  },
  { path: "/about", priority: 0.3, changeFrequency: "monthly" },
  { path: "/support", priority: 0.3, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.1, changeFrequency: "yearly" },
  { path: "/account-deletion", priority: 0.1, changeFrequency: "yearly" },
];

const BRAND_HUB_PRIORITY = 0.7;
const MODEL_HUB_PRIORITY = 0.6;
const VEHICLE_PRIORITY = 0.5;

/**
 * The vehicle's last change, or undefined when the API predates `updatedAt`
 * or sends an invalid date. An unknown lastmod is left out rather than faked.
 */
function vehicleLastModified(vehicle: CatalogVehicle): Date | undefined {
  if (!vehicle.updatedAt) return undefined;
  const date = new Date(vehicle.updatedAt);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Latest change among the given vehicles; undefined when none has a date. */
function latestLastModified(vehicles: CatalogVehicle[]): Date | undefined {
  let latest: Date | undefined;
  for (const vehicle of vehicles) {
    const date = vehicleLastModified(vehicle);
    if (date && (!latest || date > latest)) latest = date;
  }
  return latest;
}

/** Spread in only when known, so entries without a date carry no lastmod. */
function withLastModified(lastModified: Date | undefined) {
  return lastModified ? { lastModified } : {};
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await fetchAllPlatformVehicles().catch(() => []);
  const catalogLastModified = latestLastModified(vehicles);

  // Pages that don't list catalog content have no tracked change date, so
  // they carry no lastmod.
  const staticEntries: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      STATIC_PATHS.map(({ path, priority, changeFrequency, showsCatalog }) => ({
        url: `${baseUrl}/${locale}${path}`,
        ...withLastModified(showsCatalog ? catalogLastModified : undefined),
        changeFrequency,
        priority,
      }))
  );

  // Vehicle pages only show known issues in their own locale, so every URL is
  // listed only for the locales where it has content. Hubs follow their
  // vehicles: a brand/model hub is listed for a locale when at least one of
  // its vehicles has content there.
  const vehiclesByBrand = new Map<string, CatalogVehicle[]>();
  const vehiclesByModel = new Map<string, CatalogVehicle[]>();

  for (const vehicle of vehicles) {
    const makeSlug = slugify(vehicle.brand);
    const makeModelSlug = `${makeSlug}/${slugify(vehicle.model)}`;
    vehiclesByBrand.set(makeSlug, [
      ...(vehiclesByBrand.get(makeSlug) ?? []),
      vehicle,
    ]);
    vehiclesByModel.set(makeModelSlug, [
      ...(vehiclesByModel.get(makeModelSlug) ?? []),
      vehicle,
    ]);
  }

  const brandEntries: MetadataRoute.Sitemap = Array.from(
    vehiclesByBrand
  ).flatMap(([makeSlug, brandVehicles]) =>
    getContentLocales(brandVehicles).map((locale) => ({
      url: `${baseUrl}/${locale}/defects/${makeSlug}`,
      ...withLastModified(latestLastModified(brandVehicles)),
      changeFrequency: "weekly",
      priority: BRAND_HUB_PRIORITY,
    }))
  );

  const modelEntries: MetadataRoute.Sitemap = Array.from(
    vehiclesByModel
  ).flatMap(([makeModelSlug, modelVehicles]) =>
    getContentLocales(modelVehicles).map((locale) => ({
      url: `${baseUrl}/${locale}/defects/${makeModelSlug}`,
      ...withLastModified(latestLastModified(modelVehicles)),
      changeFrequency: "weekly",
      priority: MODEL_HUB_PRIORITY,
    }))
  );

  const vehicleEntries: MetadataRoute.Sitemap = vehicles.flatMap((vehicle) =>
    getContentLocales([vehicle]).map((locale) => ({
      url: `${baseUrl}/${locale}/defects/${slugify(vehicle.brand)}/${slugify(vehicle.model)}/${vehicle.yearFrom}/${vehicle.fuelType}/${slugify(vehicle.engine)}`,
      ...withLastModified(vehicleLastModified(vehicle)),
      changeFrequency: "monthly",
      priority: VEHICLE_PRIORITY,
    }))
  );

  return [
    ...staticEntries,
    ...brandEntries,
    ...modelEntries,
    ...vehicleEntries,
  ];
}
