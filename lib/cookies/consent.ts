export const COOKIE_CONSENT_NAME = "cookie_consent"
export const COOKIE_CONSENT_MAX_AGE = 60 * 60 * 24 * 365
export const COOKIE_CONSENT_ACCEPTED_VALUE = "accepted"
const COOKIE_CONSENT_CHANGE_EVENT = "cookie-consent-change"

export type CookieConsentValue = "accepted" | null

export function parseCookieConsent(raw: string | undefined | null): CookieConsentValue {
  return raw === COOKIE_CONSENT_ACCEPTED_VALUE ? "accepted" : null
}

export function readCookieConsentFromDocument(): CookieConsentValue {
  if (typeof document === "undefined") return null

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${COOKIE_CONSENT_NAME}=`))

  return parseCookieConsent(match?.split("=")[1])
}

export function subscribeToCookieConsent(onStoreChange: () => void): () => void {
  window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, onStoreChange)
  return () => window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, onStoreChange)
}

export function getCookieConsentServerSnapshot(): CookieConsentValue {
  return null
}

export function writeCookieConsentAccepted(): void {
  if (typeof document === "undefined") return

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""
  document.cookie = `${COOKIE_CONSENT_NAME}=${COOKIE_CONSENT_ACCEPTED_VALUE}; path=/; max-age=${COOKIE_CONSENT_MAX_AGE}; SameSite=Lax${secure}`
  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGE_EVENT))
}

export function hasAcceptedMarketingCookies(value: CookieConsentValue): boolean {
  return value === "accepted"
}

export function hasAcceptedMarketingCookies(value: CookieConsentValue): boolean {
  return value === "accepted"
}
