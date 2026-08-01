"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { getAdsenseClientId } from "@/lib/api/config";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const PLACEHOLDER_MIN_HEIGHT_CLASS = "min-h-[90px]";

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

  useEffect(() => {
    if (!clientId) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script may not be ready yet; safe to ignore.
    }
  }, [clientId, slot]);

  if (!clientId) {
    return (
      <aside
        className={cn("mt-10", className)}
        aria-label={t("label")}
        data-testid="adsense-placeholder"
      >
        <p className="mb-2 text-xs text-muted-foreground/70">{t("label")}</p>
        <div
          className={cn(
            "flex items-center justify-center rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-center",
            PLACEHOLDER_MIN_HEIGHT_CLASS
          )}
        >
          <p className="text-sm text-muted-foreground">{t("placeholder")}</p>
        </div>
      </aside>
    );
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
