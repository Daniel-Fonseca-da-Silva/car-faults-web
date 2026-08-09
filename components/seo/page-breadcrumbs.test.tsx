import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { PageBreadcrumbs } from "./page-breadcrumbs";

jest.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children?: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("PageBreadcrumbs", () => {
  it("renders a link for a mid-list item with a path, and static text for the home item and the last item", () => {
    render(
      <PageBreadcrumbs
        locale="pt-PT"
        items={[
          { label: "Home", path: "" },
          { label: "Defects", path: "/defects" },
          { label: "Volkswagen" },
        ]}
      />
    );

    // The home item's path is "", which is falsy, so it renders as static
    // text rather than a link — same as the actual last item.
    expect(
      screen.getByText("Home", { selector: '[aria-current="page"]' })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Defects" })).toHaveAttribute(
      "href",
      "/defects"
    );
    expect(
      screen.getByText("Volkswagen", { selector: '[aria-current="page"]' })
    ).toBeInTheDocument();
  });

  it("embeds a BreadcrumbList JSON-LD script with absolute, locale-prefixed URLs", () => {
    render(
      <PageBreadcrumbs
        locale="pt-PT"
        items={[
          { label: "Home", path: "" },
          { label: "Defects", path: "/defects" },
        ]}
      />
    );

    const script = document.querySelector(
      'script[type="application/ld+json"]'
    );
    expect(script).not.toBeNull();
    const jsonLd = JSON.parse(script?.innerHTML ?? "{}");

    expect(jsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "http://localhost:3000/pt-PT",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Defects",
          item: "http://localhost:3000/pt-PT/defects",
        },
      ],
    });
  });
});
