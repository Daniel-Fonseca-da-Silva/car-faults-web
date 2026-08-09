import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LoginFormCard } from "@/components/auth/login-form-card";
import { LoginHeroPanel } from "@/components/auth/login-hero-panel";
import type { Locale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LoginPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.login" });

  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/login",
    locale,
    noIndex: true,
  });
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <LoginFormCard />
      <LoginHeroPanel />
    </div>
  );
}
