import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { redirect } from "next/navigation";

import { SiteShell } from "@/components/layout/site-shell";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ProfileDashboard } from "@/components/profile/profile-dashboard";
import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import type { Locale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { getProfilePageData } from "@/lib/profile/get-profile-page-data";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

const BACKGROUND_IMAGE_SRC = "/profile/profile-background.webp";

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
    <div className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src={BACKGROUND_IMAGE_SRC}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
      </div>

      <SiteShell className="py-12 sm:py-16">
        <Reveal>
          <ProfilePageHeader />
        </Reveal>

        <Stagger className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,18rem)_1fr]">
          <StaggerItem>
            <ProfileSidebar user={user} locale={locale} />
          </StaggerItem>
          <StaggerItem>
            <ProfileDashboard stats={stats} vehicles={vehicles} />
          </StaggerItem>
        </Stagger>
      </SiteShell>
    </div>
  );
}
