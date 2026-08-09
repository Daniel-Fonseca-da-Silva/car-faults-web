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

jest.mock("@/components/ads/adsense-script", () => ({
  AdSenseScript: () => <div data-testid="adsense-script" />,
}));

jest.mock("@/components/cookies/cookie-consent-provider", () => ({
  CookieConsentProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="cookie-consent-provider">{children}</div>
  ),
}));

jest.mock("@/components/cookies/cookie-consent-modal", () => ({
  CookieConsentModal: () => <div data-testid="cookie-consent-modal" />,
}));

describe("LocaleLayout", () => {
  it("renders the header, children and footer for a supported locale", async () => {
    const jsx = await LocaleLayout({
      children: <p>page content</p>,
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    expect(screen.getByTestId("site-header")).toBeInTheDocument();
    expect(screen.getByText("page content")).toBeInTheDocument();
    expect(screen.getByTestId("site-footer")).toBeInTheDocument();
  });

  it("wraps the page in the cookie consent provider and renders the AdSense script and modal", async () => {
    const jsx = await LocaleLayout({
      children: <p>page content</p>,
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    expect(screen.getByTestId("cookie-consent-provider")).toBeInTheDocument();
    expect(screen.getByTestId("adsense-script")).toBeInTheDocument();
    expect(screen.getByTestId("cookie-consent-modal")).toBeInTheDocument();
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
