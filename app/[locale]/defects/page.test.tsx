import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { locales } from "@/i18n/locales";

import DefectsHubPage, {
  generateMetadata,
  generateStaticParams,
} from "./page";

jest.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { namespace: string }) => {
    const namespace = typeof arg === "string" ? arg : arg.namespace;
    return (key: string, values?: Record<string, unknown>) => {
      if (key === "resultsFor") return `Results for "${values?.query}"`;
      return `${namespace}.${key}`;
    };
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

// FaultCardGrid renders the async FaultCard server component as an
// un-awaited JSX child. react-dom's client renderer can't resolve that
// (no Suspense boundary), so it's mocked here — the grid itself is
// covered separately in fault-card-grid.test.tsx.
jest.mock("@/components/faults/fault-card-grid", () => ({
  FaultCardGrid: ({ entries }: { entries: unknown[] }) => (
    <div data-testid="fault-card-grid">{entries.length}</div>
  ),
}));

describe("DefectsHubPage", () => {
  it("renders the hub title and subtitle when there is no query", async () => {
    const jsx = await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "faults.hub.title" })
    ).toBeInTheDocument();
    expect(screen.getByText("faults.hub.subtitle")).toBeInTheDocument();
  });

  it("filters vehicles by the make search param and shows the query summary", async () => {
    const jsx = await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({ make: "volkswagen" }),
    });
    render(jsx);

    expect(screen.getByText('Results for "volkswagen"')).toBeInTheDocument();
    expect(screen.getByTestId("fault-card-grid")).toHaveTextContent("3");
  });

  it("shows a no-results message when the filters match no vehicle", async () => {
    const jsx = await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({ make: "tesla" }),
    });
    render(jsx);

    expect(screen.getByText("faults.hub.noResults")).toBeInTheDocument();
  });

  it("narrows the results when model, year, fuel and doors are all provided", async () => {
    const jsx = await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({
        make: "volkswagen",
        model: "golf",
        year: "2018",
        fuel: "diesel",
        doors: "5",
      }),
    });
    render(jsx);

    expect(screen.getByTestId("fault-card-grid")).toHaveTextContent("1");
  });

  it("excludes vehicles whose engines don't match the fuel filter", async () => {
    const jsx = await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({ fuel: "hybrid" }),
    });
    render(jsx);

    expect(screen.getByTestId("fault-card-grid")).toHaveTextContent("1");
  });

  it("excludes vehicles whose door counts don't match the doors filter", async () => {
    const jsx = await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({ doors: "4" }),
    });
    render(jsx);

    expect(screen.getByTestId("fault-card-grid")).toHaveTextContent("2");
  });
});

describe("generateMetadata", () => {
  it("builds a localized title and description", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.title).toBe("seo.defectsHub.title");
    expect(metadata.description).toBe("seo.defectsHub.description");
  });
});

describe("generateStaticParams", () => {
  it("returns a param entry for every supported locale", () => {
    expect(generateStaticParams()).toEqual(
      locales.map((locale) => ({ locale }))
    );
  });
});
