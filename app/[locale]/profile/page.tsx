import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteShell } from "@/components/layout/site-shell";
import { ProfileDashboard } from "@/components/profile/profile-dashboard";
import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import { routing } from "@/i18n/routing";
import { getProfilePageData } from "@/lib/profile/get-profile-page-data";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.profile" });

  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user, stats, vehicles } = getProfilePageData();

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
