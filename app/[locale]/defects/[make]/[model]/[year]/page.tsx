import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/layout/site-shell";
import { KnownIssuesAccordion } from "@/components/vehicle/known-issues-accordion";
import { KnownIssuesSummary } from "@/components/vehicle/known-issues-summary";
import { VehicleBackLink } from "@/components/vehicle/vehicle-back-link";
import { VehicleHero } from "@/components/vehicle/vehicle-hero";
import { VehicleTechSpecs } from "@/components/vehicle/vehicle-tech-specs";
import { routing } from "@/i18n/routing";
import {
  countSeverities,
  findLookup,
  listLookupStaticParams,
} from "@/lib/mocks/lookup-results";
import { formatYearRange } from "@/lib/utils";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    listLookupStaticParams().map((params) => ({ locale, ...params }))
  );
}

interface VehiclePageProps {
  params: Promise<{
    locale: string;
    make: string;
    model: string;
    year: string;
  }>;
}

export async function generateMetadata({
  params,
}: VehiclePageProps): Promise<Metadata> {
  const { locale, make, model, year } = await params;
  const lookup = findLookup(make, model, Number(year));
  if (!lookup) return {};

  const t = await getTranslations({ locale, namespace: "seo.vehiclePage" });
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

export default async function VehiclePage({ params }: VehiclePageProps) {
  const { locale, make, model, year } = await params;
  setRequestLocale(locale);

  const lookup = findLookup(make, model, Number(year));
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

      <p className="mt-10 text-xs text-muted-foreground/80">
        {t("disclaimer")}
      </p>
    </SiteShell>
  );
}
