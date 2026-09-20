import { render, screen } from "@testing-library/react";

import { SupportHero } from "./support-hero";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

describe("SupportHero", () => {
  it("renders the author name, role and intro", async () => {
    const jsx = await SupportHero();
    render(jsx);

    expect(screen.getByText("support.authorName")).toBeInTheDocument();
    expect(screen.getByText("support.authorRole")).toBeInTheDocument();
    expect(screen.getByText("support.intro")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "support.title", level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByAltText("support.photoAlt")).toBeInTheDocument();
  });
});
