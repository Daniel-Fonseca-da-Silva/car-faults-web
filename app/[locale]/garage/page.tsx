import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { GarageHero } from "@/components/garage/garage-hero";
import { GarageKnownIssues } from "@/components/garage/garage-known-issues";
import { GarageVehicleList } from "@/components/garage/garage-vehicle-list";
import { SiteShell } from "@/components/layout/site-shell";
import type { Locale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { getGaragePageData } from "@/lib/garage/get-garage-page-data";
import { mapLookupLanguage } from "@/lib/lookup/map-lookup-language";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface GaragePageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ vehicleId?: string }>;
}

export async function generateMetadata({
  params,
}: GaragePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.garage" });

  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/garage",
    locale,
    noIndex: true,
  });
}

export default async function GaragePage({
  params,
  searchParams,
}: GaragePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { vehicleId } = await searchParams;

  const data = await getGaragePageData(locale, vehicleId);
  if (!data) {
    redirect(`/${locale}/login`);
  }

  const { vehicles, nextCursor, selectedVehicle } = data;
  const language = mapLookupLanguage(locale);

  return (
    <SiteShell className="py-12 sm:py-16">
      <GarageHero vehicle={selectedVehicle} />

      {vehicles.length === 0 ? (
        <div className="mt-6">
          <GarageVehicleList
            vehicles={vehicles}
            nextCursor={nextCursor}
            selectedVehicleId={null}
            locale={locale}
            language={language}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
          <GarageVehicleList
            vehicles={vehicles}
            nextCursor={nextCursor}
            selectedVehicleId={selectedVehicle?.id ?? null}
            locale={locale}
            language={language}
          />
          {selectedVehicle && <GarageKnownIssues vehicle={selectedVehicle} />}
        </div>
      )}
    </SiteShell>
  );
}
