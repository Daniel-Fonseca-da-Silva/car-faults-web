"use client"

import { XIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { useCookieConsent } from "@/components/cookies/cookie-consent-provider"
import { Link } from "@/i18n/navigation"

export function CookieConsentModal() {
  const t = useTranslations("common.cookies")
  const { mounted, isOpen, dismiss } = useCookieConsent()

  if (!mounted || !isOpen) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-describedby="cookie-consent-description"
      className="fixed bottom-4 left-4 z-50 max-w-sm rounded-lg border border-border bg-background p-4 pr-8 shadow-lg sm:max-w-md"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("close")}
        className="absolute right-2 top-2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
      >
        <XIcon className="h-4 w-4" aria-hidden="true" />
      </button>

      <p id="cookie-consent-description" className="text-sm text-muted-foreground">
        {t("description")}{" "}
        <Link
          href="/privacy#privacy"
          className="underline underline-offset-4 hover:text-foreground"
        >
          {t("privacyLink")}
        </Link>
      </p>
    </div>
  )
}
