import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import LocaleNotFound from "./not-found";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "common.notFound.title": "Page not found",
      "common.notFound.description":
        "The page you are looking for doesn't exist or has moved.",
      "common.notFound.backHome": "Back to home",
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

describe("LocaleNotFound", () => {
  it("renders the title and description", async () => {
    const jsx = await LocaleNotFound();
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "Page not found" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "The page you are looking for doesn't exist or has moved."
      )
    ).toBeInTheDocument();
  });

  it("links back to the homepage", async () => {
    const jsx = await LocaleNotFound();
    render(jsx);

    const link = screen.getByRole("link", { name: "Back to home" });
    expect(link).toHaveAttribute("href", "/");
  });
});
