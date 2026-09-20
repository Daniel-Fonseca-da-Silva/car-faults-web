import { render, screen } from "@testing-library/react";

import { locales } from "@/i18n/locales";

import SupportPage, {
  generateMetadata,
  generateStaticParams,
} from "./page";

jest.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { namespace: string }) => {
    const namespace = typeof arg === "string" ? arg : arg.namespace;
    return (key: string) => `${namespace}.${key}`;
  },
  setRequestLocale: jest.fn(),
}));

jest.mock("next-intl", () => ({
  useLocale: () => "pt-PT",
  useTranslations: () => (key: string) => `support.${key}`,
}));

jest.mock("@/components/support/support-hero", () => ({
  SupportHero: () => <div data-testid="support-hero" />,
}));

jest.mock("@/components/support/support-benefits", () => ({
  SupportBenefits: () => <div data-testid="support-benefits" />,
}));

describe("SupportPage", () => {
  it("renders the hero, benefits and donation card", async () => {
    const jsx = await SupportPage({
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    expect(screen.getByTestId("support-hero")).toBeInTheDocument();
    expect(screen.getByTestId("support-benefits")).toBeInTheDocument();
    expect(screen.getByText("+351 913 619 053")).toBeInTheDocument();
  });
});

describe("generateMetadata", () => {
  it("builds a localized title and description", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT" }),
    });

    expect(metadata.title).toBe("seo.support.title");
    expect(metadata.description).toBe("seo.support.description");
  });
});

describe("generateStaticParams", () => {
  it("returns a param entry for every supported locale", () => {
    expect(generateStaticParams()).toEqual(
      locales.map((locale) => ({ locale }))
    );
  });
});
