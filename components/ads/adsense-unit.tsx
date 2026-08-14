"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { useCookieConsent } from "@/components/cookies/cookie-consent-provider";
import { isConfiguredAdSlot } from "@/lib/ads/is-configured-ad-slot";
import { getAdsenseClientId } from "@/lib/api/config";
import { hasAcceptedMarketingCookies } from "@/lib/cookies/consent";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export interface AdSenseUnitProps {
  slot: string;
  format?: string;
  className?: string;
}

export function AdSenseUnit({
  slot,
  format = "auto",
  className,
}: AdSenseUnitProps) {
  const t = useTranslations("common.ads");
  const clientId = getAdsenseClientId();
  const { consent } = useCookieConsent();
  const isConfigured = Boolean(clientId) && isConfiguredAdSlot(slot);
  const adsEnabled = isConfigured && hasAcceptedMarketingCookies(consent);

  useEffect(() => {
    if (!adsEnabled) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script may not be ready yet; safe to ignore.
    }
  }, [adsEnabled, slot]);

  if (!isConfigured || !adsEnabled) {
    return null;
  }

  return (
    <div className={cn("mt-10", className)}>
      <p className="mb-2 text-xs text-muted-foreground/70">{t("label")}</p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
