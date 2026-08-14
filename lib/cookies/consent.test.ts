import {
  COOKIE_CONSENT_NAME,
  hasAcceptedMarketingCookies,
  parseCookieConsent,
  readCookieConsentFromDocument,
  writeCookieConsent,
} from "./consent"

function clearCookies() {
  document.cookie = `${COOKIE_CONSENT_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

describe("parseCookieConsent", () => {
  it("returns accepted for the accepted value", () => {
    expect(parseCookieConsent("accepted")).toBe("accepted")
  })

  it("returns rejected for the rejected value", () => {
    expect(parseCookieConsent("rejected")).toBe("rejected")
  })

  it.each([undefined, null, "", "maybe", "Accepted", "Rejected"])(
    "returns null for invalid value %p",
    (value) => {
      expect(parseCookieConsent(value as string | undefined | null)).toBeNull()
    }
  )
})

describe("readCookieConsentFromDocument / writeCookieConsent", () => {
  afterEach(() => {
    clearCookies()
  })

  it("returns null when no consent cookie is set", () => {
    expect(readCookieConsentFromDocument()).toBeNull()
  })

  it("writes and reads back an accepted consent", () => {
    writeCookieConsent("accepted")

    expect(readCookieConsentFromDocument()).toBe("accepted")
  })

  it("writes and reads back a rejected consent", () => {
    writeCookieConsent("rejected")

    expect(readCookieConsentFromDocument()).toBe("rejected")
  })
})

describe("hasAcceptedMarketingCookies", () => {
  it("returns true only for accepted", () => {
    expect(hasAcceptedMarketingCookies("accepted")).toBe(true)
  })

  it("returns false for rejected", () => {
    expect(hasAcceptedMarketingCookies("rejected")).toBe(false)
  })

  it("returns false for null", () => {
    expect(hasAcceptedMarketingCookies(null)).toBe(false)
  })
})
