import { render, screen } from "@testing-library/react";

import { locales } from "@/i18n/locales";

import PrivacyPage, { generateMetadata, generateStaticParams } from "./page";

jest.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { namespace: string }) => {
    const namespace = typeof arg === "string" ? arg : arg.namespace;
    return (key: string) => `${namespace}.${key}`;
  },
  setRequestLocale: jest.fn(),
}));

jest.mock("@/components/privacy/privacy-hero", () => ({
  PrivacyHero: () => <h1>privacy.hero.title</h1>,
}));

jest.mock("@/components/privacy/legal-section-nav", () => ({
  LegalSectionNav: () => (
    <nav>
      <a href="#privacy">privacy.nav.privacy</a>
      <a href="#terms">privacy.nav.terms</a>
    </nav>
  ),
}));

describe("PrivacyPage", () => {
  it("renders the hero title and legal section navigation", async () => {
    const jsx = await PrivacyPage({
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "privacy.hero.title", level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "privacy.nav.privacy" })
    ).toHaveAttribute("href", "#privacy");
    expect(
      screen.getByRole("link", { name: "privacy.nav.terms" })
    ).toHaveAttribute("href", "#terms");
  });

  it("renders the privacy policy and terms of service documents", async () => {
    const jsx = await PrivacyPage({
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "privacy.policy.title", level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "privacy.terms.title", level: 2 })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "privacy.policy.sections.scope.heading",
        level: 3,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "privacy.terms.sections.provider.heading",
        level: 3,
      })
    ).toBeInTheDocument();
  });
});

describe("generateMetadata", () => {
  it("builds a localized title and description", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT" }),
    });

    expect(metadata.title).toBe("seo.privacy.title");
    expect(metadata.description).toBe("seo.privacy.description");
  });
});

describe("generateStaticParams", () => {
  it("returns a param entry for every supported locale", () => {
    expect(generateStaticParams()).toEqual(
      locales.map((locale) => ({ locale }))
    );
  });
});
