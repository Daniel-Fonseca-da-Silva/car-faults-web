import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import LocaleLayout, { generateStaticParams } from "./layout";

jest.mock("next-intl", () => ({
  hasLocale: (locales: readonly string[], locale: string) =>
    locales.includes(locale),
  NextIntlClientProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock("next-intl/server", () => ({
  setRequestLocale: jest.fn(),
}));

jest.mock("@/components/footer/site-footer", () => ({
  SiteFooter: () => <div data-testid="site-footer" />,
}));

jest.mock("@/components/header/site-header", () => ({
  SiteHeader: () => <div data-testid="site-header" />,
}));

const getAdsenseClientId = jest.fn();

jest.mock("@/lib/api/config", () => ({
  getAdsenseClientId: () => getAdsenseClientId(),
}));

jest.mock("next/script", () => ({
  __esModule: true,
  default: (props: { src?: string }) => (
    <div data-testid="adsense-script" data-src={props.src} />
  ),
}));

describe("LocaleLayout", () => {
  afterEach(() => {
    getAdsenseClientId.mockReset();
  });

  it("renders the header, children and footer for a supported locale", async () => {
    getAdsenseClientId.mockReturnValue(undefined);
    const jsx = await LocaleLayout({
      children: <p>page content</p>,
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    expect(screen.getByTestId("site-header")).toBeInTheDocument();
    expect(screen.getByText("page content")).toBeInTheDocument();
    expect(screen.getByTestId("site-footer")).toBeInTheDocument();
  });

  it("does not render the AdSense script when no client id is configured", async () => {
    getAdsenseClientId.mockReturnValue(undefined);
    const jsx = await LocaleLayout({
      children: <p>page content</p>,
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    expect(screen.queryByTestId("adsense-script")).not.toBeInTheDocument();
  });

  it("renders the AdSense script with the client id when configured", async () => {
    getAdsenseClientId.mockReturnValue("ca-pub-1234567890123456");
    const jsx = await LocaleLayout({
      children: <p>page content</p>,
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    expect(screen.getByTestId("adsense-script")).toHaveAttribute(
      "data-src",
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
    );
  });

  it("triggers a not-found response for an unsupported locale", async () => {
    await expect(
      LocaleLayout({
        children: <p>page content</p>,
        params: Promise.resolve({ locale: "fr-FR" }),
      })
    ).rejects.toThrow();
  });
});

describe("generateStaticParams", () => {
  it("returns a param entry for every supported locale", () => {
    expect(generateStaticParams()).toEqual([
      { locale: "pt-PT" },
      { locale: "en-GB" },
      { locale: "es-ES" },
    ]);
  });
});
