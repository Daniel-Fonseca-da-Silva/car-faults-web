import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { COOKIE_CONSENT_NAME } from "@/lib/cookies/consent";

import { CookieConsentProvider, useCookieConsent } from "./cookie-consent-provider";

function clearConsentCookie() {
  document.cookie = `${COOKIE_CONSENT_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function Consumer() {
  const { consent, mounted, isOpen, dismiss, openPreferences } = useCookieConsent();

  return (
    <div>
      <span data-testid="consent">{String(consent)}</span>
      <span data-testid="mounted">{String(mounted)}</span>
      <span data-testid="is-open">{String(isOpen)}</span>
      <button onClick={dismiss}>dismiss</button>
      <button onClick={openPreferences}>open</button>
    </div>
  );
}

describe("CookieConsentProvider", () => {
  afterEach(() => {
    clearConsentCookie();
  });

  it("throws when useCookieConsent is used outside the provider", () => {
    const ConsumerWithoutProvider = () => {
      useCookieConsent();
      return null;
    };

    expect(() => render(<ConsumerWithoutProvider />)).toThrow(
      "useCookieConsent must be used within a CookieConsentProvider."
    );
  });

  it("reads the existing consent cookie once mounted and keeps the modal closed", async () => {
    document.cookie = `${COOKIE_CONSENT_NAME}=accepted; path=/;`;

    render(
      <CookieConsentProvider>
        <Consumer />
      </CookieConsentProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("mounted")).toHaveTextContent("true")
    );
    expect(screen.getByTestId("consent")).toHaveTextContent("accepted");
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
  });

  it("opens the modal once mounted when no consent cookie exists", async () => {
    render(
      <CookieConsentProvider>
        <Consumer />
      </CookieConsentProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("is-open")).toHaveTextContent("true")
    );
  });

  it("writes an accepted cookie and closes the modal on dismiss", async () => {
    const user = userEvent.setup();
    render(
      <CookieConsentProvider>
        <Consumer />
      </CookieConsentProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("is-open")).toHaveTextContent("true")
    );

    await user.click(screen.getByText("dismiss"));

    expect(screen.getByTestId("consent")).toHaveTextContent("accepted");
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
    expect(document.cookie).toContain(`${COOKIE_CONSENT_NAME}=accepted`);
  });

  it("reopens the modal via openPreferences and closes it again on dismiss", async () => {
    const user = userEvent.setup();
    document.cookie = `${COOKIE_CONSENT_NAME}=accepted; path=/;`;

    render(
      <CookieConsentProvider>
        <Consumer />
      </CookieConsentProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("is-open")).toHaveTextContent("false")
    );

    await user.click(screen.getByText("open"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");

    await user.click(screen.getByText("dismiss"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
  });
});
