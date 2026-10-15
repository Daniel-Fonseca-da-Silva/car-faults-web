import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/layout/site-shell";
import { PageBreadcrumbs } from "@/components/seo/page-breadcrumbs";
import { KnownIssuesAccordion } from "@/components/vehicle/known-issues-accordion";
import { KnownIssuesSummary } from "@/components/vehicle/known-issues-summary";
import { MercadoLivreProducts } from "@/components/vehicle/mercado-livre-products";
import { VehicleBackLink } from "@/components/vehicle/vehicle-back-link";
import { VehicleHero } from "@/components/vehicle/vehicle-hero";
import { VehicleTechSpecs } from "@/components/vehicle/vehicle-tech-specs";
import type { Locale } from "@/i18n/locales";
import { getAmazonStore } from "@/lib/affiliate/amazon";
import { getMercadoLivreProducts } from "@/lib/affiliate/mercado-livre";
import { getVehicleLookupByPath } from "@/lib/api/lookups";
import {
  findCatalogVehicle,
  getContentLocales,
} from "@/lib/api/platform-catalog";
import { countSeverities } from "@/lib/lookup/count-severities";
import { mapLookupLanguage } from "@/lib/lookup/map-lookup-language";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";
import { serializeJsonLd } from "@/lib/seo/json-ld";
import { formatYearRange } from "@/lib/utils";
import type { LookupResponse } from "@/types/lookup";

export interface VehiclePageParams {
  locale: Locale;
  make: string;
  model: string;
  year: string;
  fuelType: string;
  engine: string;
}

/**
 * Shared by the vehicle page and its doors variant (see proxy.ts). Neither
 * reads the session or the query string, so each URL is rendered once and
 * served to every visitor from the cache.
 */
async function resolveLookup(
  params: VehiclePageParams,
  doors: number | undefined
): Promise<LookupResponse | null> {
  return getVehicleLookupByPath({
    make: params.make,
    model: params.model,
    year: Number(params.year),
    fuelType: params.fuelType,
    engine: params.engine,
    doors,
    language: mapLookupLanguage(params.locale),
  });
}

export async function buildVehiclePageMetadata(
  resolvedParams: VehiclePageParams,
  doors?: number
): Promise<Metadata> {
  const lookup = await resolveLookup(resolvedParams, doors);
  if (!lookup) return {};

  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: "seo.vehiclePage",
  });
  const genericTitle = `${lookup.vehicle.brand} ${lookup.vehicle.model}`;
  const variant =
    lookup.vehicle.name && lookup.vehicle.name !== genericTitle
      ? ` (${lookup.vehicle.name})`
      : "";
  const templateValues = {
    make: lookup.vehicle.brand,
    model: lookup.vehicle.model,
    variant,
    year: formatYearRange(lookup.vehicle.yearFrom, lookup.vehicle.yearTo),
  };

  const path = `/defects/${resolvedParams.make}/${resolvedParams.model}/${resolvedParams.year}/${resolvedParams.fuelType}/${resolvedParams.engine}`;

  // Known issues are per locale and this page doesn't generate missing ones,
  // so a locale without issues is an empty page: keep it out of the index and
  // point hreflang only at the locales that have content.
  const hasKnownIssues = lookup.knownIssues.length > 0;
  const catalogVehicle = hasKnownIssues
    ? await findCatalogVehicle({
        makeSlug: resolvedParams.make,
        modelSlug: resolvedParams.model,
        yearFrom: lookup.vehicle.yearFrom,
        fuelType: resolvedParams.fuelType,
        engineSlug: resolvedParams.engine,
      })
    : null;

  return buildPageMetadata({
    title: t("titleTemplate", templateValues),
    description: t("descriptionTemplate", templateValues),
    path,
    locale: resolvedParams.locale,
    noIndexFollow: !hasKnownIssues,
    alternateLocales: hasKnownIssues
      ? catalogVehicle
        ? getContentLocales([catalogVehicle])
        : undefined
      : [resolvedParams.locale],
  });
}

export async function VehiclePageView({
  params: resolvedParams,
  doors,
}: {
  params: VehiclePageParams;
  doors?: number;
}) {
  setRequestLocale(resolvedParams.locale);

  const lookup = await resolveLookup(resolvedParams, doors);
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
  const year = Number(resolvedParams.year);

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
          vehicleLabel={`${vehicle.brand} ${vehicle.model}`}
          amazonStore={getAmazonStore(resolvedParams.locale)}
        />
      )}

      <MercadoLivreProducts
        products={getMercadoLivreProducts(resolvedParams.locale)}
        title={t("vehicle.mercadoLivre.title", {
          vehicle: `${vehicle.brand} ${vehicle.model}`,
        })}
        subtitle={t("vehicle.mercadoLivre.subtitle")}
        disclosure={t("vehicle.mercadoLivre.disclosure")}
        labels={{
          steeringWheelCover: t("vehicle.mercadoLivre.products.steeringWheelCover"),
          lubricantSpray: t("vehicle.mercadoLivre.products.lubricantSpray"),
          engineOil: t("vehicle.mercadoLivre.products.engineOil"),
          battery: t("vehicle.mercadoLivre.products.battery"),
          wipers: t("vehicle.mercadoLivre.products.wipers"),
          tools: t("vehicle.mercadoLivre.products.tools"),
          headlightBulbs: t("vehicle.mercadoLivre.products.headlightBulbs"),
        }}
      />

      <p className="mt-10 text-xs text-muted-foreground/80">
        {t("disclaimer")}
      </p>
    </SiteShell>
  );
}
