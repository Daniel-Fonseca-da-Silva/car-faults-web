import { render, screen } from "@testing-library/react";

import { SupportBenefits } from "./support-benefits";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

describe("SupportBenefits", () => {
  it("renders a card for each benefit", async () => {
    const jsx = await SupportBenefits();
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "support.benefitsTitle" })
    ).toBeInTheDocument();

    for (const key of ["servers", "features", "coffee"]) {
      expect(screen.getByText(`support.benefits.${key}.title`)).toBeInTheDocument();
      expect(screen.getByText(`support.benefits.${key}.body`)).toBeInTheDocument();
    }
  });
});
