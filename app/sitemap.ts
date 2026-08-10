import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { fetchAllPlatformVehicles } from "@/lib/api/platform-catalog";
import { getSiteUrl } from "@/lib/seo/get-site-url";
import { slugify } from "@/lib/utils";

const baseUrl = getSiteUrl();

const STATIC_PATHS: {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
}[] = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/defects", priority: 0.9, changeFrequency: "daily" },
  { path: "/about", priority: 0.3, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.1, changeFrequency: "yearly" },
];

const BRAND_HUB_PRIORITY = 0.7;
const MODEL_HUB_PRIORITY = 0.6;
const VEHICLE_PRIORITY = 0.5;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      STATIC_PATHS.map(({ path, priority, changeFrequency }) => ({
        url: `${baseUrl}/${locale}${path}`,
        lastModified,
        changeFrequency,
        priority,
      }))
  );

  const vehicles = await fetchAllPlatformVehicles().catch(() => []);

  const brandSlugs = new Set<string>();
  const modelSlugs = new Set<string>();

  for (const vehicle of vehicles) {
    const makeSlug = slugify(vehicle.brand);
    brandSlugs.add(makeSlug);
    modelSlugs.add(`${makeSlug}/${slugify(vehicle.model)}`);
  }

  const brandEntries: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      Array.from(brandSlugs).map((makeSlug) => ({
        url: `${baseUrl}/${locale}/defects/${makeSlug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: BRAND_HUB_PRIORITY,
      }))
  );

  const modelEntries: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      Array.from(modelSlugs).map((makeModelSlug) => ({
        url: `${baseUrl}/${locale}/defects/${makeModelSlug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: MODEL_HUB_PRIORITY,
      }))
  );

  const vehicleEntries: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      vehicles.map((vehicle) => ({
        url: `${baseUrl}/${locale}/defects/${slugify(vehicle.brand)}/${slugify(vehicle.model)}/${vehicle.yearFrom}/${vehicle.fuelType}/${slugify(vehicle.engine)}`,
        lastModified,
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
