"use client";

import { useTranslations } from "next-intl";

import { useCookieConsent } from "@/components/cookies/cookie-consent-provider";

export function CookieSettingsButton() {
  const t = useTranslations("common.cookies");
  const { openPreferences } = useCookieConsent();

  return (
    <button
      type="button"
      onClick={openPreferences}
      className="underline-offset-4 hover:text-foreground hover:underline"
    >
      {t("manage")}
    </button>
  );
}
