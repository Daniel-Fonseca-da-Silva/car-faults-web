import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import type { TopFaultEntry } from "@/types/vehicle";

import ModelHubPage, { generateMetadata } from "./page";

const getCatalogBrandMock = jest.fn();
const getCatalogModelMock = jest.fn();
const getCatalogVariantsMock = jest.fn();
const getPlatformFaultsMock = jest.fn();

jest.mock("@/lib/api/platform-catalog", () => ({
  getCatalogBrand: (...args: unknown[]) => getCatalogBrandMock(...args),
  getCatalogModel: (...args: unknown[]) => getCatalogModelMock(...args),
  getCatalogVariants: (...args: unknown[]) => getCatalogVariantsMock(...args),
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
const golfModel = { slug: "golf", name: "Golf" };

const variants = [
  {
    brand: "Volkswagen",
    model: "Golf",
    yearFrom: 2018,
    engine: "2.0 TDI",
    fuelType: "diesel",
    doors: 5,
  },
  {
    brand: "Volkswagen",
    model: "Golf",
    yearFrom: 2015,
    engine: "1.6 TDI",
    fuelType: "diesel",
  },
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

describe("ModelHubPage", () => {
  afterEach(() => {
    getCatalogBrandMock.mockReset();
    getCatalogModelMock.mockReset();
    getCatalogVariantsMock.mockReset();
    getPlatformFaultsMock.mockReset();
  });

  it("renders the model's variants and top faults", async () => {
    getCatalogBrandMock.mockResolvedValue(volkswagenBrand);
    getCatalogModelMock.mockResolvedValue(golfModel);
    getCatalogVariantsMock.mockResolvedValue(variants);
    getPlatformFaultsMock.mockResolvedValue({
      items: topFaults,
      total: 1,
      page: 1,
      limit: 9,
    });

    const jsx = await ModelHubPage({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "volkswagen",
        model: "golf",
      }),
    });
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "Volkswagen Golf" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "2018 · 2.0 TDI" })
    ).toHaveAttribute(
      "href",
      "/defects/volkswagen/golf/2018/diesel/2-0-tdi?doors=5"
    );
    expect(
      screen.getByRole("link", { name: "2015 · 1.6 TDI" })
    ).toHaveAttribute("href", "/defects/volkswagen/golf/2015/diesel/1-6-tdi");
    expect(screen.getByTestId("fault-card-grid")).toHaveTextContent("1");
    expect(getPlatformFaultsMock).toHaveBeenCalledWith({
      locale: "pt-PT",
      brand: "Volkswagen",
      model: "Golf",
      limit: 9,
    });
  });

  it("shows the no-variants message when the model has no variants", async () => {
    getCatalogBrandMock.mockResolvedValue(volkswagenBrand);
    getCatalogModelMock.mockResolvedValue(golfModel);
    getCatalogVariantsMock.mockResolvedValue([]);
    getPlatformFaultsMock.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 9,
    });

    const jsx = await ModelHubPage({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "volkswagen",
        model: "golf",
      }),
    });
    render(jsx);

    expect(
      screen.getByText("faults.modelHub.noVariants")
    ).toBeInTheDocument();
  });

  it("shows the no-faults message when there are no top faults", async () => {
    getCatalogBrandMock.mockResolvedValue(volkswagenBrand);
    getCatalogModelMock.mockResolvedValue(golfModel);
    getCatalogVariantsMock.mockResolvedValue(variants);
    getPlatformFaultsMock.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 9,
    });

    const jsx = await ModelHubPage({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "volkswagen",
        model: "golf",
      }),
    });
    render(jsx);

    expect(screen.getByText("faults.modelHub.noFaults")).toBeInTheDocument();
    expect(
      screen.queryByTestId("fault-card-grid")
    ).not.toBeInTheDocument();
  });

  it("triggers a not-found response when the brand doesn't match the catalog", async () => {
    getCatalogBrandMock.mockResolvedValue(null);
    getCatalogModelMock.mockResolvedValue(golfModel);

    await expect(
      ModelHubPage({
        params: Promise.resolve({
          locale: "pt-PT",
          make: "tesla",
          model: "golf",
        }),
      })
    ).rejects.toThrow();
    expect(getCatalogVariantsMock).not.toHaveBeenCalled();
  });

  it("triggers a not-found response when the model doesn't match the brand", async () => {
    getCatalogBrandMock.mockResolvedValue(volkswagenBrand);
    getCatalogModelMock.mockResolvedValue(null);

    await expect(
      ModelHubPage({
        params: Promise.resolve({
          locale: "pt-PT",
          make: "volkswagen",
          model: "polo",
        }),
      })
    ).rejects.toThrow();
    expect(getCatalogVariantsMock).not.toHaveBeenCalled();
  });
});

describe("generateMetadata", () => {
  afterEach(() => {
    getCatalogBrandMock.mockReset();
    getCatalogModelMock.mockReset();
  });

  it("builds a localized title, description and canonical path for a known model", async () => {
    getCatalogBrandMock.mockResolvedValue(volkswagenBrand);
    getCatalogModelMock.mockResolvedValue(golfModel);

    const metadata = await generateMetadata({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "volkswagen",
        model: "golf",
      }),
    });

    expect(metadata.title).toBe(
      'seo.modelPage.titleTemplate({"make":"Volkswagen","model":"Golf"})'
    );
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/pt-PT/defects/volkswagen/golf"
    );
  });

  it("returns an empty object when the brand or model doesn't match the catalog", async () => {
    getCatalogBrandMock.mockResolvedValue(volkswagenBrand);
    getCatalogModelMock.mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "volkswagen",
        model: "polo",
      }),
    });

    expect(metadata).toEqual({});
  });
});
