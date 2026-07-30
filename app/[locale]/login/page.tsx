import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LoginFormCard } from "@/components/auth/login-form-card";
import { LoginHeroPanel } from "@/components/auth/login-hero-panel";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.login" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((availableLocale) => [
          availableLocale,
          `/${availableLocale}/login`,
        ])
      ),
    },
  };
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
