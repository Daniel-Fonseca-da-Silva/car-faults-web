import { render, screen } from "@testing-library/react";

import { LoginHeroPanel } from "./login-hero-panel";

const heroDict: Record<string, string> = {
  "auth.hero.eyebrow": "Auto Crónica",
  "auth.hero.titleBeforeHighlight": "Know the faults",
  "auth.hero.titleHighlight": "before",
  "auth.hero.titleAfterHighlight": "you get caught off guard.",
  "auth.hero.stat": "+1.2 million faults recorded.",
  "auth.hero.imageAlt": "Classic Mini parked in a shadowy garage.",
};

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    return (key: string) => heroDict[`${namespace}.${key}`] ?? key;
  },
}));

describe("LoginHeroPanel", () => {
  it("renders the hero image, eyebrow, headline and stat", async () => {
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
      screen.getByText("+1.2 million faults recorded.")
    ).toBeInTheDocument();
  });
});
