import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { locales } from "@/i18n/locales";
import type { TopFaultEntry } from "@/types/vehicle";

import DefectsHubPage, {
  generateMetadata,
  generateStaticParams,
} from "./page";

const getPlatformFaultsMock = jest.fn();
const getCatalogBrandsMock = jest.fn();

jest.mock("@/lib/api/platform", () => ({
  getPlatformFaults: (...args: unknown[]) => getPlatformFaultsMock(...args),
}));

jest.mock("@/lib/api/platform-catalog", () => ({
  getCatalogBrands: (...args: unknown[]) => getCatalogBrandsMock(...args),
}));

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

jest.mock("@/components/faults/faults-infinite-list", () => ({
  FaultsInfiniteList: ({
    initialItems,
    initialCursor,
  }: {
    initialItems: unknown[];
    initialCursor: string | null;
  }) => (
    <div data-testid="faults-infinite-list">
      {initialItems.length}:{initialCursor ?? "end"}
    </div>
  ),
}));

const entries: TopFaultEntry[] = [
  {
    id: "top-1",
    vehicle: {
      make: "Volkswagen",
      model: "Golf",
      year: 2015,
      engine: "1.6 TDI",
      fuelType: "diesel",
    },
    faultTitle: "Timing chain tensioner wear",
    severity: "high",
    reportCount: 412,
  },
];

describe("DefectsHubPage", () => {
  beforeEach(() => {
    getCatalogBrandsMock.mockResolvedValue([]);
  });

  afterEach(() => {
    getPlatformFaultsMock.mockReset();
    getCatalogBrandsMock.mockReset();
  });

  it("renders the hub title and subtitle when there is no query", async () => {
    getPlatformFaultsMock.mockResolvedValue({
      items: entries,
      nextCursor: null,
    });

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

  it("fetches the first faults page for the current locale with a limit of 9", async () => {
    getPlatformFaultsMock.mockResolvedValue({
      items: entries,
      nextCursor: null,
    });

    await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });

    expect(getPlatformFaultsMock).toHaveBeenCalledWith({
      locale: "pt-PT",
      limit: 9,
      brand: undefined,
      model: undefined,
      year: undefined,
      fuelType: undefined,
      doors: undefined,
    });
  });

  it("maps the make/fuel search params to brand/fuelType filters and shows the query summary", async () => {
    getPlatformFaultsMock.mockResolvedValue({
      items: entries,
      nextCursor: "c2",
    });

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

    expect(getPlatformFaultsMock).toHaveBeenCalledWith({
      locale: "pt-PT",
      limit: 9,
      brand: "volkswagen",
      model: "golf",
      year: 2018,
      fuelType: "diesel",
      doors: 5,
    });
    expect(
      screen.getByText('Results for "volkswagen golf 2018"')
    ).toBeInTheDocument();
    expect(screen.getByTestId("faults-infinite-list")).toHaveTextContent(
      "1:c2"
    );
  });

  it("does not pass a page query to getPlatformFaults", async () => {
    getPlatformFaultsMock.mockResolvedValue({
      items: entries,
      nextCursor: null,
    });

    await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({ page: "2" }),
    });

    expect(getPlatformFaultsMock).toHaveBeenCalledWith(
      expect.not.objectContaining({ page: expect.anything() })
    );
  });

  it("passes an empty first page to the infinite list when there are no defects", async () => {
    getPlatformFaultsMock.mockResolvedValue({
      items: [],
      nextCursor: null,
    });

    const jsx = await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });
    render(jsx);

    expect(screen.getByTestId("faults-infinite-list")).toHaveTextContent(
      "0:end"
    );
  });

  it("does not render prev/next pagination controls", async () => {
    getPlatformFaultsMock.mockResolvedValue({
      items: entries,
      nextCursor: "c2",
    });

    const jsx = await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });
    render(jsx);

    expect(
      screen.queryByRole("button", { name: "faults.hub.previous" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "faults.hub.next" })
    ).not.toBeInTheDocument();
  });

  it("renders brand links when brands are available", async () => {
    getPlatformFaultsMock.mockResolvedValue({
      items: entries,
      nextCursor: null,
    });
    getCatalogBrandsMock.mockResolvedValue([
      { slug: "volkswagen", name: "Volkswagen" },
      { slug: "mercedes-benz", name: "Mercedes-Benz" },
    ]);

    const jsx = await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "faults.hub.browseBrandsTitle" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volkswagen" })).toHaveAttribute(
      "href",
      "/defects/volkswagen"
    );
    expect(
      screen.getByRole("link", { name: "Mercedes-Benz" })
    ).toHaveAttribute("href", "/defects/mercedes-benz");
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
