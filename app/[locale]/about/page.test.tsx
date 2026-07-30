import { render, screen } from "@testing-library/react";

import { locales } from "@/i18n/locales";

import AboutPage, { generateMetadata, generateStaticParams } from "./page";

jest.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { namespace: string }) => {
    const namespace = typeof arg === "string" ? arg : arg.namespace;
    return (key: string) => `${namespace}.${key}`;
  },
  setRequestLocale: jest.fn(),
}));

describe("AboutPage", () => {
  it("renders a coming soon stub for the about section", async () => {
    const jsx = await AboutPage({
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "nav.about" })
    ).toBeInTheDocument();
    expect(screen.getByText("common.comingSoon.title")).toBeInTheDocument();
    expect(
      screen.getByText("common.comingSoon.description")
    ).toBeInTheDocument();
  });
});

describe("generateMetadata", () => {
  it("builds a localized title and description", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT" }),
    });

    expect(metadata.title).toBe("seo.about.title");
    expect(metadata.description).toBe("seo.about.description");
  });
});

describe("generateStaticParams", () => {
  it("returns a param entry for every supported locale", () => {
    expect(generateStaticParams()).toEqual(
      locales.map((locale) => ({ locale }))
    );
  });
});
