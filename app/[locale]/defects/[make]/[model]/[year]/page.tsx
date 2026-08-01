import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AdSenseUnit } from "@/components/ads/adsense-unit";
import { SiteShell } from "@/components/layout/site-shell";
import { KnownIssuesAccordion } from "@/components/vehicle/known-issues-accordion";
import { KnownIssuesSummary } from "@/components/vehicle/known-issues-summary";
import { VehicleBackLink } from "@/components/vehicle/vehicle-back-link";
import { VehicleHero } from "@/components/vehicle/vehicle-hero";
import { VehicleTechSpecs } from "@/components/vehicle/vehicle-tech-specs";
import type { Locale } from "@/i18n/locales";
import { getVehicleLookup } from "@/lib/api/lookups";
import { countSeverities } from "@/lib/lookup/count-severities";
import { mapLookupLanguage } from "@/lib/lookup/map-lookup-language";
import { formatYearRange } from "@/lib/utils";
import type { LookupResponse } from "@/types/lookup";

// Placeholder — replace with the real AdSense ad unit slot ID once created.
const VEHICLE_PAGE_AD_SLOT = "0000000000";

interface VehiclePageParams {
  locale: Locale;
  make: string;
  model: string;
  year: string;
}

interface VehiclePageSearchParams {
  brand?: string;
  model?: string;
  engine?: string;
  fuelType?: string;
  doors?: string;
}

interface VehiclePageProps {
  params: Promise<VehiclePageParams>;
  searchParams: Promise<VehiclePageSearchParams>;
}

async function resolveLookup(
  params: VehiclePageParams,
  searchParams: VehiclePageSearchParams
): Promise<LookupResponse | null> {
  const { brand, model, engine, fuelType, doors } = searchParams;
  if (!brand || !model || !engine || !fuelType) {
    return null;
  }

  return getVehicleLookup({
    brand,
    model,
    year: Number(params.year),
    engine,
    fuelType,
    doors: doors ? Number(doors) : undefined,
    language: mapLookupLanguage(params.locale),
  }).catch(() => null);
}

export async function generateMetadata({
  params,
  searchParams,
}: VehiclePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const lookup = await resolveLookup(resolvedParams, await searchParams);
  if (!lookup) return {};

  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: "seo.vehiclePage",
  });
  const templateValues = {
    make: lookup.vehicle.brand,
    model: lookup.vehicle.model,
    year: formatYearRange(lookup.vehicle.yearFrom, lookup.vehicle.yearTo),
  };

  return {
    title: t("titleTemplate", templateValues),
    description: t("descriptionTemplate", templateValues),
  };
}

export default async function VehiclePage({
  params,
  searchParams,
}: VehiclePageProps) {
  const resolvedParams = await params;
  setRequestLocale(resolvedParams.locale);

  const lookup = await resolveLookup(resolvedParams, await searchParams);
  if (!lookup) {
    notFound();
  }

  const { vehicle, knownIssues } = lookup;
  const t = await getTranslations("faults");
  const severityCounts = countSeverities(knownIssues);

  const vehicleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    brand: vehicle.brand,
    model: vehicle.model,
    vehicleModelDate: formatYearRange(vehicle.yearFrom, vehicle.yearTo),
  };

  const faqJsonLd =
    knownIssues.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: knownIssues.map((knownIssue) => ({
            "@type": "Question",
            name: knownIssue.title,
            acceptedAnswer: {
              "@type": "Answer",
              text: knownIssue.description,
            },
          })),
        }
      : null;

  return (
    <SiteShell className="py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <VehicleBackLink />

      <div className="mt-4">
        <VehicleHero vehicle={vehicle} />
      </div>

      <div className="mt-6">
        <VehicleTechSpecs vehicle={vehicle} />
      </div>

      <KnownIssuesSummary counts={severityCounts} total={knownIssues.length} />

      <h2 className="mt-10 text-xl font-semibold text-foreground">
        {t("vehicle.knownIssuesTitle")}
      </h2>

      {knownIssues.length === 0 ? (
        <p className="mt-3 text-muted-foreground">
          {t("vehicle.noKnownIssues")}
        </p>
      ) : (
        <KnownIssuesAccordion knownIssues={knownIssues} />
      )}

      <AdSenseUnit slot={VEHICLE_PAGE_AD_SLOT} />

      <p className="mt-10 text-xs text-muted-foreground/80">
        {t("disclaimer")}
      </p>
    </SiteShell>
  );
}
