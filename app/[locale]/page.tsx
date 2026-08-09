import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { HeroSection } from "@/components/home/hero-section";
import { StatsBar } from "@/components/home/stats-bar";
import { VehicleSearchForm } from "@/components/home/vehicle-search-form";
import { SiteShell } from "@/components/layout/site-shell";
import type { Locale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { getDatabaseStatus } from "@/lib/api/platform";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.home" });

  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "",
    locale,
    titleIsAbsolute: true,
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isDatabaseUp = await getDatabaseStatus();

  return (
    <SiteShell>
      <HeroSection />
      <div className="mx-auto max-w-3xl pb-8">
        <VehicleSearchForm isDatabaseUp={isDatabaseUp} />
      </div>
      <StatsBar />
    </SiteShell>
  );
}
