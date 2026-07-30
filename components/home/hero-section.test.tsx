import { render, screen } from "@testing-library/react";

import { HeroSection } from "./hero-section";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "home.hero.eyebrow": "Automotive reliability database",
      "home.hero.titleBeforeHighlight": "Know the",
      "home.hero.titleHighlight": "faults",
      "home.hero.titleAfterHighlight": "before you buy",
      "home.hero.subtitle":
        "Search chronic faults by make, model, year and engine.",
    };
    return (key: string) => dict[`${namespace}.${key}`] ?? key;
  },
}));

describe("HeroSection", () => {
  it("renders the eyebrow, title and subtitle", async () => {
    const jsx = await HeroSection();
    render(jsx);

    expect(
      screen.getByText("Automotive reliability database")
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Know the faults before you buy"
    );
    expect(
      screen.getByText("Search chronic faults by make, model, year and engine.")
    ).toBeInTheDocument();
  });
});
