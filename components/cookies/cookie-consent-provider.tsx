"use client"

import { createContext, useCallback, useContext, useState, useSyncExternalStore } from "react"

import { applyGoogleConsent } from "@/lib/ads/google-consent-mode"
import {
  type CookieConsentValue,
  getCookieConsentServerSnapshot,
  readCookieConsentFromDocument,
  subscribeToCookieConsent,
  writeCookieConsent,
} from "@/lib/cookies/consent"

interface CookieConsentContextValue {
  consent: CookieConsentValue
  mounted: boolean
  isOpen: boolean
  accept: () => void
  reject: () => void
  openPreferences: () => void
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

const subscribeToNothing = () => () => {}
const getClientMountedSnapshot = () => true
const getServerMountedSnapshot = () => false

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const consent = useSyncExternalStore(
    subscribeToCookieConsent,
    readCookieConsentFromDocument,
    getCookieConsentServerSnapshot
  )
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    getClientMountedSnapshot,
    getServerMountedSnapshot
  )
  const [isManuallyOpen, setIsManuallyOpen] = useState(false)

  const isOpen = isManuallyOpen || (mounted && consent === null)

  const accept = useCallback(() => {
    applyGoogleConsent("granted")
    writeCookieConsent("accepted")
    setIsManuallyOpen(false)
  }, [])

  const reject = useCallback(() => {
    const hadAccepted = consent === "accepted"
    applyGoogleConsent("denied")
    writeCookieConsent("rejected")
    setIsManuallyOpen(false)
    if (hadAccepted) {
      window.location.reload()
    }
  }, [consent])

  const openPreferences = useCallback(() => {
    setIsManuallyOpen(true)
  }, [])

  return (
    <CookieConsentContext.Provider
      value={{ consent, mounted, isOpen, accept, reject, openPreferences }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider.")
  }

  return context
}
