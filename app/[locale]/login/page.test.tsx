import { render, screen } from "@testing-library/react";

import { locales } from "@/i18n/locales";

import LoginPage, { generateMetadata, generateStaticParams } from "./page";

jest.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { namespace: string }) => {
    const namespace = typeof arg === "string" ? arg : arg.namespace;
    return (key: string) => `${namespace}.${key}`;
  },
  setRequestLocale: jest.fn(),
}));

jest.mock("@/components/auth/login-form-card", () => ({
  LoginFormCard: () => <div>LoginFormCard</div>,
}));

jest.mock("@/components/auth/login-hero-panel", () => ({
  LoginHeroPanel: () => <div>LoginHeroPanel</div>,
}));

describe("LoginPage", () => {
  it("renders the login form and hero panel", async () => {
    const jsx = await LoginPage({
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    expect(screen.getByText("LoginFormCard")).toBeInTheDocument();
    expect(screen.getByText("LoginHeroPanel")).toBeInTheDocument();
  });
});

describe("generateMetadata", () => {
  it("builds a localized title, description and locale alternates", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT" }),
    });

    expect(metadata.title).toBe("seo.login.title");
    expect(metadata.description).toBe("seo.login.description");
    expect(metadata.alternates?.languages).toEqual(
      Object.fromEntries(
        locales.map((locale) => [
          locale,
          `http://localhost:3000/${locale}/login`,
        ])
      )
    );
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});

describe("generateStaticParams", () => {
  it("returns a param entry for every supported locale", () => {
    expect(generateStaticParams()).toEqual(
      locales.map((locale) => ({ locale }))
    );
  });
});
