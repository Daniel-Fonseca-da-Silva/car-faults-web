import { render, screen } from "@testing-library/react";

import { AdSenseUnit } from "./adsense-unit";

const getAdsenseClientId = jest.fn();
const useCookieConsent = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `common.ads.${key}`,
}));

jest.mock("@/lib/api/config", () => ({
  getAdsenseClientId: () => getAdsenseClientId(),
}));

jest.mock("@/components/cookies/cookie-consent-provider", () => ({
  useCookieConsent: () => useCookieConsent(),
}));

describe("AdSenseUnit", () => {
  afterEach(() => {
    getAdsenseClientId.mockReset();
    useCookieConsent.mockReset();
  });

  it("renders nothing when no AdSense client id is configured", () => {
    getAdsenseClientId.mockReturnValue(undefined);
    useCookieConsent.mockReturnValue({ consent: "accepted" });
    const { container } = render(<AdSenseUnit slot="1234567890" />);

    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByTestId("adsense-placeholder")
    ).not.toBeInTheDocument();
    expect(document.querySelector("ins.adsbygoogle")).not.toBeInTheDocument();
  });

  it("renders nothing when the slot is a placeholder of zeros", () => {
    getAdsenseClientId.mockReturnValue("ca-pub-1234567890123456");
    useCookieConsent.mockReturnValue({ consent: "accepted" });
    const { container } = render(<AdSenseUnit slot="0000000000" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the slot is empty", () => {
    getAdsenseClientId.mockReturnValue("ca-pub-1234567890123456");
    useCookieConsent.mockReturnValue({ consent: "accepted" });
    const { container } = render(<AdSenseUnit slot="" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when consent is still unknown", () => {
    getAdsenseClientId.mockReturnValue("ca-pub-1234567890123456");
    useCookieConsent.mockReturnValue({ consent: null });
    const { container } = render(<AdSenseUnit slot="1234567890" />);

    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByTestId("adsense-placeholder")
    ).not.toBeInTheDocument();
    expect(document.querySelector("ins.adsbygoogle")).not.toBeInTheDocument();
  });

  it("renders nothing when consent has been rejected", () => {
    getAdsenseClientId.mockReturnValue("ca-pub-1234567890123456");
    useCookieConsent.mockReturnValue({ consent: "rejected" });
    const { container } = render(<AdSenseUnit slot="1234567890" />);

    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByTestId("adsense-placeholder")
    ).not.toBeInTheDocument();
    expect(document.querySelector("ins.adsbygoogle")).not.toBeInTheDocument();
  });

  it("renders the ad unit with the configured client id and slot when consent is accepted", () => {
    getAdsenseClientId.mockReturnValue("ca-pub-1234567890123456");
    useCookieConsent.mockReturnValue({ consent: "accepted" });
    render(<AdSenseUnit slot="1234567890" />);

    expect(
      screen.getByText("common.ads.label")
    ).toBeInTheDocument();

    const ins = document.querySelector("ins.adsbygoogle");
    expect(ins).toHaveAttribute("data-ad-client", "ca-pub-1234567890123456");
    expect(ins).toHaveAttribute("data-ad-slot", "1234567890");
    expect(ins).toHaveAttribute("data-ad-format", "auto");
  });

  it("passes through a custom format", () => {
    getAdsenseClientId.mockReturnValue("ca-pub-1234567890123456");
    useCookieConsent.mockReturnValue({ consent: "accepted" });
    render(<AdSenseUnit slot="1234567890" format="rectangle" />);

    expect(document.querySelector("ins.adsbygoogle")).toHaveAttribute(
      "data-ad-format",
      "rectangle"
    );
  });
});
