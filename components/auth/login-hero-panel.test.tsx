import { render, screen } from "@testing-library/react";

import { LoginHeroPanel } from "./login-hero-panel";

const getPlatformStatsMock = jest.fn();

const heroDict: Record<string, string> = {
  "auth.hero.eyebrow": "Auto Crónica",
  "auth.hero.titleBeforeHighlight": "Know the faults",
  "auth.hero.titleHighlight": "before",
  "auth.hero.titleAfterHighlight": "you get caught off guard.",
  "auth.hero.stat": "{count} faults recorded.",
  "auth.hero.imageAlt": "Classic Mini parked in a shadowy garage.",
};

jest.mock("@/lib/api/platform", () => ({
  getPlatformStats: (...args: unknown[]) => getPlatformStatsMock(...args),
}));

jest.mock("next-intl/server", () => ({
  getLocale: async () => "en-GB",
  getTranslations: async (namespace: string) => {
    return (key: string, values?: Record<string, string>) => {
      const template = heroDict[`${namespace}.${key}`] ?? key;
      return values
        ? template.replace(
            /\{(\w+)\}/g,
            (_, token: string) => values[token] ?? ""
          )
        : template;
    };
  },
}));

describe("LoginHeroPanel", () => {
  afterEach(() => {
    getPlatformStatsMock.mockReset();
  });

  it("renders the hero image, eyebrow, headline and the real fault count", async () => {
    getPlatformStatsMock.mockResolvedValue({
      reportsCount: 1234567,
      vehiclesCount: 8400,
      faultsCount: 34000,
    });

    const jsx = await LoginHeroPanel();
    render(jsx);

    expect(
      screen.getByAltText("Classic Mini parked in a shadowy garage.")
    ).toBeInTheDocument();
    expect(screen.getByText("Auto Crónica")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Know the faults before you get caught off guard."
    );
    expect(
      screen.getByText("34,000+ faults recorded.")
    ).toBeInTheDocument();
  });
});
