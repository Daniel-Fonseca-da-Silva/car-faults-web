"use client";

import { Analytics } from "@vercel/analytics/next";

import { useCookieConsent } from "@/components/cookies/cookie-consent-provider";
import { hasAcceptedMarketingCookies } from "@/lib/cookies/consent";

export function ConsentGatedAnalytics() {
  const { consent } = useCookieConsent();

  if (!hasAcceptedMarketingCookies(consent)) {
    return null;
  }

  return <Analytics />;
}
