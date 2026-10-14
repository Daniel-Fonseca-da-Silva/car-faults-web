import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { ShowcaseSection } from "./showcase-section";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "home.showcase.badge": "Full vehicle profile",
      "home.showcase.titleLead": "Search smarter.",
      "home.showcase.titleHighlight": "Buy with confidence.",
      "home.showcase.subtitle": "Specs, chronic faults and owner reports.",
      "home.showcase.primaryCta": "Browse defects",
      "home.showcase.secondaryCta": "How it works",
      "home.showcase.features.ownerReports": "Real owner reports",
      "home.showcase.features.aiAnalysis": "AI-assisted analysis",
      "home.showcase.features.garage": "Garage & favourites",
      "home.showcase.imageAlt": "Ford Fiesta Mk4 vehicle profile",
    };
    return (key: string) => dict[`${namespace}.${key}`] ?? key;
  },
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: { href: string; children?: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ShowcaseSection", () => {
  it("renders the badge, two-line heading and subtitle", async () => {
    render(await ShowcaseSection());

    expect(screen.getByText("Full vehicle profile")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Search smarter.Buy with confidence."
    );
    expect(
      screen.getByText("Specs, chronic faults and owner reports.")
    ).toBeInTheDocument();
  });

  it("links the calls to action to the defects page and how-it-works section", async () => {
    render(await ShowcaseSection());

    expect(screen.getByRole("button", { name: "Browse defects" })).toHaveAttribute(
      "href",
      "/defects"
    );
    expect(screen.getByRole("button", { name: "How it works" })).toHaveAttribute(
      "href",
      "#how-it-works"
    );
  });

  it("lists every feature highlight", async () => {
    render(await ShowcaseSection());

    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Real owner reports",
      "AI-assisted analysis",
      "Garage & favourites",
    ]);
  });

  it("renders the showcase image with localized alt text", async () => {
    render(await ShowcaseSection());

    expect(
      screen.getByRole("img", { name: "Ford Fiesta Mk4 vehicle profile" })
    ).toBeInTheDocument();
  });
});
