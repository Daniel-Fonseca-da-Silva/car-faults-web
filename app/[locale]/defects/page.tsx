import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdSenseUnit } from "@/components/ads/adsense-unit";
import { FaultCardGrid } from "@/components/faults/fault-card-grid";
import { SiteShell } from "@/components/layout/site-shell";
import { routing } from "@/i18n/routing";
import { vehicles } from "@/lib/mocks/vehicles";
import type { TopFaultEntry } from "@/types/vehicle";

// Placeholder — replace with the real AdSense ad unit slot ID once created.
const DEFECTS_HUB_AD_SLOT = "0000000001";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type SearchParamValue = string | string[] | undefined;
type ResolvedSearchParams = Record<string, SearchParamValue>;

interface DefectsHubPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<ResolvedSearchParams>;
}

export async function generateMetadata({
  params,
}: DefectsHubPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.defectsHub" });

  return { title: t("title"), description: t("description") };
}

function toQueryValue(value: SearchParamValue): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() || undefined;
}

export default async function DefectsHubPage({
  params,
  searchParams,
}: DefectsHubPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const resolvedSearchParams = await searchParams;
  const make = toQueryValue(resolvedSearchParams.make)?.toLowerCase();
  const model = toQueryValue(resolvedSearchParams.model)?.toLowerCase();
  const year = toQueryValue(resolvedSearchParams.year);
  const fuel = toQueryValue(resolvedSearchParams.fuel);
  const doors = toQueryValue(resolvedSearchParams.doors);

  const filtered = vehicles.filter((vehicle) => {
    if (make && !vehicle.make.toLowerCase().includes(make)) return false;
    if (model && !vehicle.model.toLowerCase().includes(model)) return false;
    if (year && String(vehicle.year) !== year) return false;
    if (fuel && !vehicle.engines.some((engine) => engine.fuel === fuel))
      return false;
    if (doors && !vehicle.doors.includes(Number(doors))) return false;
    return true;
  });

  const hasQuery = Boolean(make || model || year || fuel || doors);
  const t = await getTranslations("faults.hub");

  const entries: TopFaultEntry[] = filtered.map((vehicle) => {
    const topFault = vehicle.faults[0];
    return {
      id: `${vehicle.makeSlug}-${vehicle.modelSlug}-${vehicle.year}`,
      vehicle: {
        makeSlug: vehicle.makeSlug,
        make: vehicle.make,
        modelSlug: vehicle.modelSlug,
        model: vehicle.model,
        year: vehicle.year,
      },
      faultTitle: topFault?.title ?? "",
      severity: topFault?.severity ?? "low",
      reportCount: topFault?.reportCount ?? 0,
    };
  });

  return (
    <SiteShell className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        {hasQuery
          ? t("resultsFor", {
              query: [make, model, year].filter(Boolean).join(" "),
            })
          : t("subtitle")}
      </p>

      <div className="mt-8">
        {entries.length > 0 ? (
          <FaultCardGrid entries={entries} />
        ) : (
          <p className="text-muted-foreground">{t("noResults")}</p>
        )}
      </div>

      <AdSenseUnit slot={DEFECTS_HUB_AD_SLOT} />
    </SiteShell>
  );
}
