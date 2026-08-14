"use client"

import { useTranslations } from "next-intl"

import { useCookieConsent } from "@/components/cookies/cookie-consent-provider"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

export function CookieConsentModal() {
  const t = useTranslations("common.cookies")
  const { mounted, isOpen, accept, reject } = useCookieConsent()

  if (!mounted || !isOpen) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-describedby="cookie-consent-description"
      className="fixed bottom-4 left-4 z-50 max-w-sm rounded-lg border border-border bg-background p-4 shadow-lg sm:max-w-md"
    >
      <p id="cookie-consent-description" className="text-sm text-muted-foreground">
        {t("description")}{" "}
        <Link
          href="/privacy#privacy"
          className="underline underline-offset-4 hover:text-foreground"
        >
          {t("privacyLink")}
        </Link>
      </p>

      <div className="mt-4 flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={reject}
          className="flex-1"
        >
          {t("reject")}
        </Button>
        <Button type="button" onClick={accept} className="flex-1">
          {t("accept")}
        </Button>
      </div>
    </div>
  )
}
