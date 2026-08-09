import { notFound, permanentRedirect } from "next/navigation";

import type { Locale } from "@/i18n/locales";
import { buildLookupHref } from "@/lib/lookup/build-lookup-href";

interface VehicleRedirectParams {
  locale: Locale;
  year: string;
}

interface VehicleRedirectSearchParams {
  brand?: string;
  model?: string;
  engine?: string;
  fuelType?: string;
  doors?: string;
}

interface VehicleRedirectProps {
  params: Promise<VehicleRedirectParams>;
  searchParams: Promise<VehicleRedirectSearchParams>;
}

// Bridges the old 3-segment URL (identity carried in the query string) to
// the canonical path-based URL, so existing bookmarks/shares keep working.
export default async function VehicleRedirectPage({
  params,
  searchParams,
}: VehicleRedirectProps) {
  const { locale, year } = await params;
  const { brand, model, engine, fuelType, doors } = await searchParams;

  if (!brand || !model || !engine || !fuelType) {
    notFound();
  }

  const href = buildLookupHref({
    brand,
    model,
    year: Number(year),
    engine,
    fuelType,
    doors: doors ? Number(doors) : undefined,
  });

  permanentRedirect(`/${locale}${href}`);
}
