import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteShell } from "@/components/layout/site-shell";
import { LegalDocument } from "@/components/privacy/legal-document";
import type { Locale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

const SECTION_IDS = [
  "overview",
  "inApp",
  "withoutApp",
  "dataDeleted",
  "dataRetained",
  "timeframe",
  "contact",
] as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface AccountDeletionPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: AccountDeletionPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.accountDeletion" });

  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/account-deletion",
    locale,
  });
}

export default async function AccountDeletionPage({
  params,
}: AccountDeletionPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("account-deletion");

  const sections = SECTION_IDS.map((id) => ({
    id,
    heading: t(`policy.sections.${id}.heading`),
    body: t(`policy.sections.${id}.body`),
  }));

  return (
    <SiteShell className="max-w-3xl py-12 sm:py-16">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {t("hero.title")}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
        {t("hero.lead")}
      </p>

      <div className="mt-10">
        <LegalDocument
          id="account-deletion"
          title={t("policy.title")}
          effectiveDate={t("policy.effectiveDate")}
          lastUpdated={t("policy.lastUpdated")}
          sections={sections}
        />
      </div>
    </SiteShell>
  );
}
