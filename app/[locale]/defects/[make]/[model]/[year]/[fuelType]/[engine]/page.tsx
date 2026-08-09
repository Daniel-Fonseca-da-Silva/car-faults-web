import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/layout/site-shell";
import { PageBreadcrumbs } from "@/components/seo/page-breadcrumbs";
import { KnownIssuesAccordion } from "@/components/vehicle/known-issues-accordion";
import { KnownIssuesSummary } from "@/components/vehicle/known-issues-summary";
import { VehicleBackLink } from "@/components/vehicle/vehicle-back-link";
import { VehicleHero } from "@/components/vehicle/vehicle-hero";
import { VehicleTechSpecs } from "@/components/vehicle/vehicle-tech-specs";
import type { Locale } from "@/i18n/locales";
import { getVehicleFavoriteStatus } from "@/lib/api/activity-logs";
import { getVehicleLookupByPath } from "@/lib/api/lookups";
import { getCurrentUser, getCurrentUserVehicles } from "@/lib/api/users";
import { countSeverities } from "@/lib/lookup/count-severities";
import { mapLookupLanguage } from "@/lib/lookup/map-lookup-language";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";
import { serializeJsonLd } from "@/lib/seo/json-ld";
import { formatYearRange } from "@/lib/utils";
import type { LookupResponse } from "@/types/lookup";

interface VehiclePageParams {
  locale: Locale;
  make: string;
  model: string;
  year: string;
  fuelType: string;
  engine: string;
}

interface VehiclePageSearchParams {
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
  const { doors } = searchParams;

  return getVehicleLookupByPath({
    make: params.make,
    model: params.model,
    year: Number(params.year),
    fuelType: params.fuelType,
    engine: params.engine,
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

  const path = `/defects/${resolvedParams.make}/${resolvedParams.model}/${resolvedParams.year}/${resolvedParams.fuelType}/${resolvedParams.engine}`;

  return buildPageMetadata({
    title: t("titleTemplate", templateValues),
    description: t("descriptionTemplate", templateValues),
    path,
    locale: resolvedParams.locale,
  });
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
  const [t, tNav, tCommon] = await Promise.all([
    getTranslations("faults"),
    getTranslations("nav"),
    getTranslations("common"),
  ]);
  const severityCounts = countSeverities(knownIssues);
  const currentUser = await getCurrentUser();
  const year = Number(resolvedParams.year);

  let garageVehicleId: string | null = null;
  let isFavorited = false;
  if (currentUser) {
    const [vehicles, favoriteStatus] = await Promise.all([
      getCurrentUserVehicles(),
      getVehicleFavoriteStatus(vehicle.id),
    ]);
    garageVehicleId =
      vehicles.find(
        (userVehicle) =>
          userVehicle.vehicleModelId === vehicle.id &&
          userVehicle.year === year
      )?.id ?? null;
    isFavorited = favoriteStatus.favorited;
  }

  const currentPath = `/${resolvedParams.locale}/defects/${resolvedParams.make}/${resolvedParams.model}/${resolvedParams.year}/${resolvedParams.fuelType}/${resolvedParams.engine}`;

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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(vehicleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
        />
      )}

      <PageBreadcrumbs
        locale={resolvedParams.locale}
        items={[
          { label: tCommon("breadcrumbs.home"), path: "" },
          { label: tNav("defects"), path: "/defects" },
          {
            label: vehicle.brand,
            path: `/defects/${resolvedParams.make}`,
          },
          {
            label: vehicle.model,
            path: `/defects/${resolvedParams.make}/${resolvedParams.model}`,
          },
          { label: `${vehicle.model} ${formatYearRange(vehicle.yearFrom, vehicle.yearTo)}` },
        ]}
      />

      <div className="mt-4">
        <VehicleBackLink />
      </div>

      <div className="mt-4">
        <VehicleHero
          vehicle={vehicle}
          year={year}
          currentUser={currentUser}
          garageVehicleId={garageVehicleId}
          isFavorited={isFavorited}
          currentPath={currentPath}
        />
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
        <KnownIssuesAccordion
          knownIssues={knownIssues}
          currentUser={currentUser}
        />
      )}

      <p className="mt-10 text-xs text-muted-foreground/80">
        {t("disclaimer")}
      </p>
    </SiteShell>
  );
}
