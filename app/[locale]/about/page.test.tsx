import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { locales } from "@/i18n/locales";

import AboutPage, { generateMetadata, generateStaticParams } from "./page";

jest.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { namespace: string }) => {
    const namespace = typeof arg === "string" ? arg : arg.namespace;
    return (key: string) => `${namespace}.${key}`;
  },
  setRequestLocale: jest.fn(),
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

describe("AboutPage", () => {
  it("renders the title, photo and section headings", async () => {
    const jsx = await AboutPage({
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "about.title", level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByAltText("about.photoAlt")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "about.problemTitle" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "about.solutionTitle" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "about.communityTitle" })
    ).toBeInTheDocument();
  });

  it("links to the LinkedIn profile in a new tab", async () => {
    const jsx = await AboutPage({
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    const linkedinLink = screen.getByRole("link", {
      name: "about.linkedinLabel",
    });
    expect(linkedinLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/daniel-fonseca-da-silva/"
    );
    expect(linkedinLink).toHaveAttribute("target", "_blank");
    expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("links the primary CTA to the defects hub", async () => {
    const jsx = await AboutPage({
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    const cta = screen.getByRole("button", { name: "about.ctaLabel" });
    expect(cta).toHaveAttribute("href", "/defects");
  });
});

describe("generateMetadata", () => {
  it("builds a localized title and description", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT" }),
    });

    expect(metadata.title).toBe("seo.about.title");
    expect(metadata.description).toBe("seo.about.description");
  });
});

describe("generateStaticParams", () => {
  it("returns a param entry for every supported locale", () => {
    expect(generateStaticParams()).toEqual(
      locales.map((locale) => ({ locale }))
    );
  });
});
