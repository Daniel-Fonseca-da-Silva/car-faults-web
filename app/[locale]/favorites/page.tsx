import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { FavoritesGrid } from "@/components/favorites/favorites-grid";
import { SiteShell } from "@/components/layout/site-shell";
import type { Locale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { getFavoriteVehicles } from "@/lib/api/activity-logs";
import { getCurrentUser } from "@/lib/api/users";
import { FAVORITES_PAGE_SIZE } from "@/lib/lists/page-sizes";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface FavoritesPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: FavoritesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.favorites" });

  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/favorites",
    locale,
    noIndex: true,
  });
}

export default async function FavoritesPage({ params }: FavoritesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations("favorites");
  const { items, nextCursor } = await getFavoriteVehicles({
    limit: FAVORITES_PAGE_SIZE,
  });

  return (
    <SiteShell className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{t("subtitle")}</p>
      <FavoritesGrid initialItems={items} initialCursor={nextCursor} />
    </SiteShell>
  );
}
