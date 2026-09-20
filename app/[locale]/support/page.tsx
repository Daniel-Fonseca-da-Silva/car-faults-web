import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteShell } from "@/components/layout/site-shell";
import { SupportBenefits } from "@/components/support/support-benefits";
import { SupportDonationCard } from "@/components/support/support-donation-card";
import { SupportHero } from "@/components/support/support-hero";
import type { Locale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { generatePixBrCode } from "@/lib/pix/generate-pix-br-code";
import { generateQrSvg } from "@/lib/qr/generate-qr-svg";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";
import {
  PIX_KEY,
  PIX_MERCHANT_CITY,
  PIX_MERCHANT_NAME,
  WISE_PAY_LINK,
} from "@/lib/support-constants";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface SupportPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: SupportPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.support" });

  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/support",
    locale,
  });
}

export default async function SupportPage({ params }: SupportPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const pixBrCode = generatePixBrCode({
    pixKey: PIX_KEY,
    merchantName: PIX_MERCHANT_NAME,
    merchantCity: PIX_MERCHANT_CITY,
  });

  const [wiseQrSvg, pixQrSvg] = await Promise.all([
    generateQrSvg(WISE_PAY_LINK),
    generateQrSvg(pixBrCode),
  ]);

  return (
    <SiteShell className="max-w-3xl py-12 sm:py-16">
      <SupportHero />
      <SupportBenefits />
      <SupportDonationCard
        wiseQrSvg={wiseQrSvg}
        pixQrSvg={pixQrSvg}
        pixBrCode={pixBrCode}
      />
    </SiteShell>
  );
}
