import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import type { TopFaultEntry } from "@/types/vehicle";

import BrandHubPage, { generateMetadata } from "./page";

const getCatalogBrandMock = jest.fn();
const getCatalogModelsMock = jest.fn();
const getPlatformFaultsMock = jest.fn();

jest.mock("@/lib/api/platform-catalog", () => ({
  getCatalogBrand: (...args: unknown[]) => getCatalogBrandMock(...args),
  getCatalogModels: (...args: unknown[]) => getCatalogModelsMock(...args),
}));

jest.mock("@/lib/api/platform", () => ({
  getPlatformFaults: (...args: unknown[]) => getPlatformFaultsMock(...args),
}));

jest.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { namespace: string }) => {
    const namespace = typeof arg === "string" ? arg : arg.namespace;
    return (key: string, values?: Record<string, unknown>) => {
      if (values) return `${namespace}.${key}(${JSON.stringify(values)})`;
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

jest.mock("@/components/seo/page-breadcrumbs", () => ({
  PageBreadcrumbs: ({ items }: { items: { label: string }[] }) => (
    <nav data-testid="page-breadcrumbs">
      {items.map((item) => item.label).join(" > ")}
    </nav>
  ),
}));

jest.mock("@/components/faults/fault-card-grid", () => ({
  FaultCardGrid: ({ entries }: { entries: unknown[] }) => (
    <div data-testid="fault-card-grid">{entries.length}</div>
  ),
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

const volkswagenBrand = { slug: "volkswagen", name: "Volkswagen" };

const models = [
  { slug: "golf", name: "Golf" },
  { slug: "polo", name: "Polo" },
];

const topFaults: TopFaultEntry[] = [
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

describe("BrandHubPage", () => {
  afterEach(() => {
    getCatalogBrandMock.mockReset();
    getCatalogModelsMock.mockReset();
    getPlatformFaultsMock.mockReset();
  });

  it("renders the brand's models and top faults", async () => {
    getCatalogBrandMock.mockResolvedValue(volkswagenBrand);
    getCatalogModelsMock.mockResolvedValue(models);
    getPlatformFaultsMock.mockResolvedValue({
      items: topFaults,
      nextCursor: null,
    });

    const jsx = await BrandHubPage({
      params: Promise.resolve({ locale: "pt-PT", make: "volkswagen" }),
    });
    render(jsx);

    expect(
      screen.getByRole("heading", {
        name: 'faults.brandHub.modelsTitle({"make":"Volkswagen"})',
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Golf" })).toHaveAttribute(
      "href",
      "/defects/volkswagen/golf"
    );
    expect(screen.getByRole("link", { name: "Polo" })).toHaveAttribute(
      "href",
      "/defects/volkswagen/polo"
    );
    expect(screen.getByTestId("fault-card-grid")).toHaveTextContent("1");
    expect(getPlatformFaultsMock).toHaveBeenCalledWith({
      locale: "pt-PT",
      brand: "Volkswagen",
      limit: 9,
    });
  });

  it("shows the no-models message when the brand has no models", async () => {
    getCatalogBrandMock.mockResolvedValue(volkswagenBrand);
    getCatalogModelsMock.mockResolvedValue([]);
    getPlatformFaultsMock.mockResolvedValue({
      items: [],
      nextCursor: null,
      limit: 9,
    });

    const jsx = await BrandHubPage({
      params: Promise.resolve({ locale: "pt-PT", make: "volkswagen" }),
    });
    render(jsx);

    expect(
      screen.getByText("faults.brandHub.noModels")
    ).toBeInTheDocument();
  });

  it("shows the no-faults message when there are no top faults", async () => {
    getCatalogBrandMock.mockResolvedValue(volkswagenBrand);
    getCatalogModelsMock.mockResolvedValue(models);
    getPlatformFaultsMock.mockResolvedValue({
      items: [],
      nextCursor: null,
      limit: 9,
    });

    const jsx = await BrandHubPage({
      params: Promise.resolve({ locale: "pt-PT", make: "volkswagen" }),
    });
    render(jsx);

    expect(screen.getByText("faults.brandHub.noFaults")).toBeInTheDocument();
    expect(
      screen.queryByTestId("fault-card-grid")
    ).not.toBeInTheDocument();
  });

  it("triggers a not-found response when the brand slug doesn't match the catalog", async () => {
    getCatalogBrandMock.mockResolvedValue(null);

    await expect(
      BrandHubPage({
        params: Promise.resolve({ locale: "pt-PT", make: "tesla" }),
      })
    ).rejects.toThrow();
    expect(getCatalogModelsMock).not.toHaveBeenCalled();
  });
});

describe("generateMetadata", () => {
  afterEach(() => {
    getCatalogBrandMock.mockReset();
  });

  it("builds a localized title, description and canonical path for a known brand", async () => {
    getCatalogBrandMock.mockResolvedValue(volkswagenBrand);

    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT", make: "volkswagen" }),
    });

    expect(metadata.title).toBe(
      'seo.brandPage.titleTemplate({"make":"Volkswagen"})'
    );
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/pt-PT/defects/volkswagen"
    );
  });

  it("returns an empty object when the brand slug doesn't match the catalog", async () => {
    getCatalogBrandMock.mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT", make: "tesla" }),
    });

    expect(metadata).toEqual({});
  });
});
