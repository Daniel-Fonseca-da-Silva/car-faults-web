import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { vehicles } from "@/lib/mocks/vehicles";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_PATHS = ["", "/recalls", "/defects", "/compare", "/about"];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      STATIC_PATHS.map((path) => ({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
      }))
  );

  const vehicleEntries: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      vehicles.map((vehicle) => ({
        url: `${baseUrl}/${locale}/defects/${vehicle.makeSlug}/${vehicle.modelSlug}/${vehicle.year}`,
        lastModified: new Date(),
      }))
  );

  return [...staticEntries, ...vehicleEntries];
}
