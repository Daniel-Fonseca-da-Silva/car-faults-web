import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { getPlatformVehicles } from "@/lib/api/platform";
import { slugify } from "@/lib/utils";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_PATHS = ["", "/defects", "/about", "/privacy"];
const SITEMAP_PAGE_LIMIT = 200;

async function fetchAllPlatformVehicles() {
  const items = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await getPlatformVehicles({
      page,
      limit: SITEMAP_PAGE_LIMIT,
    });
    items.push(...result.items);

    hasMore = items.length < result.total && result.items.length > 0;
    page += 1;
  }

  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      STATIC_PATHS.map((path) => ({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
      }))
  );

  const vehicles = await fetchAllPlatformVehicles();
  const vehicleEntries: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      vehicles.map((vehicle) => ({
        url: `${baseUrl}/${locale}/defects/${slugify(vehicle.brand)}/${slugify(vehicle.model)}/${vehicle.yearFrom}/${vehicle.fuelType}/${slugify(vehicle.engine)}`,
        lastModified: new Date(),
      }))
  );

  return [...staticEntries, ...vehicleEntries];
}
