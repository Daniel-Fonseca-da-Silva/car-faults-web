import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteShell } from "@/components/layout/site-shell";
import { LegalDocument } from "@/components/privacy/legal-document";
import { LegalSectionNav } from "@/components/privacy/legal-section-nav";
import { PrivacyHero } from "@/components/privacy/privacy-hero";
import { routing } from "@/i18n/routing";

const POLICY_SECTION_IDS = [
  "scope",
  "controller",
  "dataCollected",
  "legalBasis",
  "aiProcessing",
  "dataSharing",
  "internationalTransfers",
  "retention",
  "rights",
  "exercisingRights",
  "cookies",
  "security",
  "minors",
  "communications",
  "updates",
  "contact",
] as const;

const TERMS_SECTION_IDS = [
  "provider",
  "acceptance",
  "eligibility",
  "acceptableUse",
  "advertisingPayments",
  "intellectualProperty",
  "dataProtection",
  "cookies",
  "legalCompliance",
  "indemnification",
  "liability",
  "termination",
  "serviceModifications",
  "governingLaw",
  "additionalProvisions",
] as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.privacy" });

  return { title: t("title"), description: t("description") };
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("privacy");

  const policySections = POLICY_SECTION_IDS.map((id) => ({
    id,
    heading: t(`policy.sections.${id}.heading`),
    body: t(`policy.sections.${id}.body`),
  }));

  const termsSections = TERMS_SECTION_IDS.map((id) => ({
    id,
    heading: t(`terms.sections.${id}.heading`),
    body: t(`terms.sections.${id}.body`),
  }));

  return (
    <SiteShell className="max-w-3xl py-12 sm:py-16">
      <PrivacyHero />

      <div className="mt-8">
        <LegalSectionNav />
      </div>

      <div className="mt-10 space-y-16">
        <LegalDocument
          id="privacy"
          title={t("policy.title")}
          effectiveDate={t("policy.effectiveDate")}
          lastUpdated={t("policy.lastUpdated")}
          sections={policySections}
        />

        <LegalDocument
          id="terms"
          title={t("terms.title")}
          effectiveDate={t("terms.effectiveDate")}
          lastUpdated={t("terms.lastUpdated")}
          sections={termsSections}
        />
      </div>
    </SiteShell>
  );
}
