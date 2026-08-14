import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { COOKIE_CONSENT_NAME } from "@/lib/cookies/consent";

import { CookieConsentProvider, useCookieConsent } from "./cookie-consent-provider";

function clearConsentCookie() {
  document.cookie = `${COOKIE_CONSENT_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function Consumer() {
  const { consent, mounted, isOpen, accept, reject, openPreferences } = useCookieConsent();

  return (
    <div>
      <span data-testid="consent">{String(consent)}</span>
      <span data-testid="mounted">{String(mounted)}</span>
      <span data-testid="is-open">{String(isOpen)}</span>
      <button onClick={accept}>accept</button>
      <button onClick={reject}>reject</button>
      <button onClick={openPreferences}>open</button>
    </div>
  );
}

describe("CookieConsentProvider", () => {
  const originalLocation = window.location;
  const reloadMock = jest.fn();

  beforeEach(() => {
    reloadMock.mockReset();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, reload: reloadMock },
    });
  });

  afterEach(() => {
    clearConsentCookie();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
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

  it("keeps the modal closed when the consent cookie is rejected", async () => {
    document.cookie = `${COOKIE_CONSENT_NAME}=rejected; path=/;`;

    render(
      <CookieConsentProvider>
        <Consumer />
      </CookieConsentProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("mounted")).toHaveTextContent("true")
    );
    expect(screen.getByTestId("consent")).toHaveTextContent("rejected");
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

  it("writes an accepted cookie and closes the modal on accept", async () => {
    const user = userEvent.setup();
    render(
      <CookieConsentProvider>
        <Consumer />
      </CookieConsentProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("is-open")).toHaveTextContent("true")
    );

    await user.click(screen.getByText("accept"));

    expect(screen.getByTestId("consent")).toHaveTextContent("accepted");
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
    expect(document.cookie).toContain(`${COOKIE_CONSENT_NAME}=accepted`);
  });

  it("writes a rejected cookie and closes the modal on reject, without reloading on a first-time reject", async () => {
    const user = userEvent.setup();
    render(
      <CookieConsentProvider>
        <Consumer />
      </CookieConsentProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("is-open")).toHaveTextContent("true")
    );

    await user.click(screen.getByText("reject"));

    expect(screen.getByTestId("consent")).toHaveTextContent("rejected");
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
    expect(document.cookie).toContain(`${COOKIE_CONSENT_NAME}=rejected`);
    expect(reloadMock).not.toHaveBeenCalled();
  });

  it("reloads once when switching from accepted to rejected", async () => {
    document.cookie = `${COOKIE_CONSENT_NAME}=accepted; path=/;`;
    const user = userEvent.setup();
    render(
      <CookieConsentProvider>
        <Consumer />
      </CookieConsentProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("consent")).toHaveTextContent("accepted")
    );

    await user.click(screen.getByText("open"));
    await user.click(screen.getByText("reject"));

    expect(document.cookie).toContain(`${COOKIE_CONSENT_NAME}=rejected`);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("reopens the modal via openPreferences and closes it again on accept", async () => {
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

    await user.click(screen.getByText("accept"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
  });
});
