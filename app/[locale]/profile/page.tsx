import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { SiteShell } from "@/components/layout/site-shell";
import { ProfileDashboard } from "@/components/profile/profile-dashboard";
import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import type { Locale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { getProfilePageData } from "@/lib/profile/get-profile-page-data";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface ProfilePageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.profile" });

  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/profile",
    locale,
    noIndex: true,
  });
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await getProfilePageData();
  if (!data) {
    redirect(`/${locale}/login`);
  }

  const { user, stats, vehicles } = data;

  return (
    <SiteShell className="py-12 sm:py-16">
      <ProfilePageHeader />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,18rem)_1fr]">
        <ProfileSidebar user={user} locale={locale} />
        <ProfileDashboard stats={stats} vehicles={vehicles} />
      </div>
    </SiteShell>
  );
}
