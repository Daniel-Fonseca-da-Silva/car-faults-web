import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { VehicleBackLink } from "./vehicle-back-link";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "faults.vehicle.newSearch": "Nova busca",
    };
    return (key: string) => dict[`${namespace}.${key}`] ?? key;
  },
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("VehicleBackLink", () => {
  it("links back to the home page with the new-search label", async () => {
    const jsx = await VehicleBackLink();
    render(jsx);

    const link = screen.getByRole("link", { name: "Nova busca" });
    expect(link).toHaveAttribute("href", "/");
  });
});
