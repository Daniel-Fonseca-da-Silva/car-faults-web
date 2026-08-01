import { render, screen } from "@testing-library/react";

import { AdSenseUnit } from "./adsense-unit";

const getAdsenseClientId = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `common.ads.${key}`,
}));

jest.mock("@/lib/api/config", () => ({
  getAdsenseClientId: () => getAdsenseClientId(),
}));

describe("AdSenseUnit", () => {
  afterEach(() => {
    getAdsenseClientId.mockReset();
  });

  it("renders a local placeholder when no AdSense client id is configured", () => {
    getAdsenseClientId.mockReturnValue(undefined);
    render(<AdSenseUnit slot="1234567890" />);

    expect(screen.getByTestId("adsense-placeholder")).toBeInTheDocument();
    expect(screen.getByText("common.ads.label")).toBeInTheDocument();
    expect(screen.getByText("common.ads.placeholder")).toBeInTheDocument();
    expect(document.querySelector("ins.adsbygoogle")).not.toBeInTheDocument();
  });

  it("renders the ad unit with the configured client id and slot", () => {
    getAdsenseClientId.mockReturnValue("ca-pub-1234567890123456");
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
    render(<AdSenseUnit slot="1234567890" format="rectangle" />);

    expect(document.querySelector("ins.adsbygoogle")).toHaveAttribute(
      "data-ad-format",
      "rectangle"
    );
  });
});
