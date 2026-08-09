import {
  COOKIE_CONSENT_NAME,
  hasAcceptedMarketingCookies,
  parseCookieConsent,
  readCookieConsentFromDocument,
  writeCookieConsentAccepted,
} from "./consent"

function clearCookies() {
  document.cookie = `${COOKIE_CONSENT_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

describe("parseCookieConsent", () => {
  it("returns accepted for the accepted value", () => {
    expect(parseCookieConsent("accepted")).toBe("accepted")
  })

  it.each([undefined, null, "", "maybe", "Accepted", "rejected"])(
    "returns null for invalid value %p",
    (value) => {
      expect(parseCookieConsent(value as string | undefined | null)).toBeNull()
    }
  )
})

describe("readCookieConsentFromDocument / writeCookieConsentAccepted", () => {
  afterEach(() => {
    clearCookies()
  })

  it("returns null when no consent cookie is set", () => {
    expect(readCookieConsentFromDocument()).toBeNull()
  })

  it("writes and reads back an accepted consent", () => {
    writeCookieConsentAccepted()

    expect(readCookieConsentFromDocument()).toBe("accepted")
  })
})

describe("hasAcceptedMarketingCookies", () => {
  it("returns true only for accepted", () => {
    expect(hasAcceptedMarketingCookies("accepted")).toBe(true)
  })

  it("returns false for null", () => {
    expect(hasAcceptedMarketingCookies(null)).toBe(false)
  })
})
