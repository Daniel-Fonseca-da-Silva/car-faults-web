import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteShell } from "@/components/layout/site-shell";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface RecallsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: RecallsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.recalls" });

  return { title: t("title"), description: t("description") };
}

export default async function RecallsPage({ params }: RecallsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tNav = await getTranslations("nav");
  const tComingSoon = await getTranslations("common.comingSoon");

  return (
    <SiteShell className="py-16 text-center">
      <h1 className="text-3xl font-bold tracking-tight">
        {tNav("recalls")}
      </h1>
      <p className="mt-3 text-lg font-medium text-primary">
        {tComingSoon("title")}
      </p>
      <p className="mt-2 text-muted-foreground">
        {tComingSoon("description")}
      </p>
    </SiteShell>
  );
}
