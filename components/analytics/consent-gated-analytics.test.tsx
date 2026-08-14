import { render, screen } from "@testing-library/react";

import { ConsentGatedAnalytics } from "./consent-gated-analytics";

const useCookieConsent = jest.fn();

jest.mock("@/components/cookies/cookie-consent-provider", () => ({
  useCookieConsent: () => useCookieConsent(),
}));

jest.mock("@vercel/analytics/next", () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}));

describe("ConsentGatedAnalytics", () => {
  afterEach(() => {
    useCookieConsent.mockReset();
  });

  it("renders nothing when consent is unknown", () => {
    useCookieConsent.mockReturnValue({ consent: null });
    const { container } = render(<ConsentGatedAnalytics />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when consent has been rejected", () => {
    useCookieConsent.mockReturnValue({ consent: "rejected" });
    const { container } = render(<ConsentGatedAnalytics />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders Analytics when consent has been accepted", () => {
    useCookieConsent.mockReturnValue({ consent: "accepted" });
    render(<ConsentGatedAnalytics />);

    expect(screen.getByTestId("vercel-analytics")).toBeInTheDocument();
  });
});
