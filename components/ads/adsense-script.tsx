"use client"

import Script from "next/script"

import { useCookieConsent } from "@/components/cookies/cookie-consent-provider"
import { getAdsenseClientId } from "@/lib/api/config"
import { hasAcceptedMarketingCookies } from "@/lib/cookies/consent"

export function AdSenseScript() {
  const { consent } = useCookieConsent()
  const clientId = getAdsenseClientId()

  if (!clientId || !hasAcceptedMarketingCookies(consent)) {
    return null
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
