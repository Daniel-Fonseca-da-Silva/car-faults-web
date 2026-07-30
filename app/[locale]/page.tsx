import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { HeroSection } from "@/components/home/hero-section";
import { StatsBar } from "@/components/home/stats-bar";
import { TopFaultsSection } from "@/components/home/top-faults-section";
import { VehicleSearchForm } from "@/components/home/vehicle-search-form";
import { SiteShell } from "@/components/layout/site-shell";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.home" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((availableLocale) => [
          availableLocale,
          `/${availableLocale}`,
        ])
      ),
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <SiteShell>
      <HeroSection />
      <div className="mx-auto max-w-3xl pb-8">
        <VehicleSearchForm />
      </div>
      <StatsBar />
      <TopFaultsSection />
    </SiteShell>
  );
}
