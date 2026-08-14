import { render, screen } from "@testing-library/react";

import { AdSenseScript } from "./adsense-script";

const getAdsenseClientId = jest.fn();
const useCookieConsent = jest.fn();

jest.mock("@/lib/api/config", () => ({
  getAdsenseClientId: () => getAdsenseClientId(),
}));

jest.mock("@/components/cookies/cookie-consent-provider", () => ({
  useCookieConsent: () => useCookieConsent(),
}));

jest.mock("next/script", () => ({
  __esModule: true,
  default: (props: { src?: string }) => (
    <div data-testid="adsense-script" data-src={props.src} />
  ),
}));

describe("AdSenseScript", () => {
  afterEach(() => {
    getAdsenseClientId.mockReset();
    useCookieConsent.mockReset();
  });

  it("does not render when no client id is configured", () => {
    getAdsenseClientId.mockReturnValue(undefined);
    useCookieConsent.mockReturnValue({ consent: "accepted" });
    render(<AdSenseScript />);

    expect(screen.queryByTestId("adsense-script")).not.toBeInTheDocument();
  });

  it("does not render while consent is still unknown", () => {
    getAdsenseClientId.mockReturnValue("ca-pub-1234567890123456");
    useCookieConsent.mockReturnValue({ consent: null });
    render(<AdSenseScript />);

    expect(screen.queryByTestId("adsense-script")).not.toBeInTheDocument();
  });

  it("does not render when consent has been rejected", () => {
    getAdsenseClientId.mockReturnValue("ca-pub-1234567890123456");
    useCookieConsent.mockReturnValue({ consent: "rejected" });
    render(<AdSenseScript />);

    expect(screen.queryByTestId("adsense-script")).not.toBeInTheDocument();
  });

  it("renders the AdSense script once a client id is configured and consent is accepted", () => {
    getAdsenseClientId.mockReturnValue("ca-pub-1234567890123456");
    useCookieConsent.mockReturnValue({ consent: "accepted" });
    render(<AdSenseScript />);

    expect(screen.getByTestId("adsense-script")).toHaveAttribute(
      "data-src",
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
    );
  });
});
