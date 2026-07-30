import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { findVehicle, relatedVehicles, vehicles } from "@/lib/mocks/vehicles";
import type { FaultSeverity } from "@/types/vehicle";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    vehicles.map((vehicle) => ({
      locale,
      make: vehicle.makeSlug,
      model: vehicle.modelSlug,
      year: String(vehicle.year),
    }))
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
  const vehicle = findVehicle(make, model, Number(year));
  if (!vehicle) return {};

  const t = await getTranslations({ locale, namespace: "seo.vehiclePage" });
  const templateValues = {
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
  };

  return {
    title: t("titleTemplate", templateValues),
    description: t("descriptionTemplate", templateValues),
  };
}

const SEVERITY_BADGE_VARIANT: Record<
  FaultSeverity,
  "outline" | "secondary" | "destructive"
> = {
  low: "outline",
  medium: "secondary",
  high: "destructive",
  critical: "destructive",
};

export default async function VehiclePage({ params }: VehiclePageProps) {
  const { locale, make, model, year } = await params;
  setRequestLocale(locale);

  const vehicle = findVehicle(make, model, Number(year));
  if (!vehicle) {
    notFound();
  }

  const t = await getTranslations("faults");
  const related = relatedVehicles(vehicle);

  const vehicleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    brand: vehicle.make,
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
  };

  const faqJsonLd =
    vehicle.faults.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: vehicle.faults.map((fault) => ({
            "@type": "Question",
            name: fault.title,
            acceptedAnswer: {
              "@type": "Answer",
              text: fault.description,
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

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {vehicle.make} {vehicle.model} {vehicle.year}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("reportsCount", { count: vehicle.reportCount })}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>
          {t("engines")}:{" "}
          {vehicle.engines.map((engine) => engine.label).join(", ")}
        </span>
        <span>
          {t("doors")}: {vehicle.doors.join("/")}
        </span>
      </div>

      <h2 className="mt-10 text-xl font-semibold text-foreground">
        {t("faultsListTitle")}
      </h2>

      {vehicle.faults.length === 0 ? (
        <p className="mt-3 text-muted-foreground">{t("noFaults")}</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {vehicle.faults.map((fault) => (
            <Card key={fault.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-foreground">
                    {fault.title}
                  </h3>
                  <Badge
                    variant={SEVERITY_BADGE_VARIANT[fault.severity]}
                    className="shrink-0"
                  >
                    {t(`severity.${fault.severity}`)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {fault.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("reportsCount", { count: fault.reportCount })}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {t("typicalCost")}:{" "}
                  {t("costRange", {
                    min: fault.typicalCost.min,
                    max: fault.typicalCost.max,
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-foreground">
            {t("relatedYears")}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {related.map((relatedVehicle) => (
              <Link
                key={relatedVehicle.year}
                href={`/defects/${relatedVehicle.makeSlug}/${relatedVehicle.modelSlug}/${relatedVehicle.year}`}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:border-primary hover:text-primary"
              >
                {relatedVehicle.year}
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="mt-10 text-xs text-muted-foreground/80">
        {t("disclaimer")}
      </p>
    </SiteShell>
  );
}
