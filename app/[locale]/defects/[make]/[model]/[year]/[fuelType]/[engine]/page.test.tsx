import { render, screen } from "@testing-library/react";
import Link from "next/link";

import type { LookupResponse } from "@/types/lookup";

import VehiclePage, {
  generateMetadata,
  generateStaticParams,
  revalidate,
} from "./page";
import { VehiclePageView } from "./vehicle-page";

const getVehicleLookupByPathMock = jest.fn();
const getCurrentUserMock = jest.fn();
const findCatalogVehicleMock = jest.fn();

jest.mock("@/lib/api/lookups", () => ({
  getVehicleLookupByPath: (...args: unknown[]) =>
    getVehicleLookupByPathMock(...args),
}));

jest.mock("@/lib/api/platform-catalog", () => ({
  findCatalogVehicle: (...args: unknown[]) => findCatalogVehicleMock(...args),
  getContentLocales: jest.requireActual("@/lib/api/platform-catalog")
    .getContentLocales,
}));

// Only to prove the page never reads the session (see below).
jest.mock("@/lib/api/users", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUserMock(...args),
}));

jest.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { namespace: string }) => {
    const namespace = typeof arg === "string" ? arg : arg.namespace;
    return (key: string, values?: Record<string, unknown>) => {
      if (values) {
        return `${namespace}.${key}(${JSON.stringify(values)})`;
      }
      return `${namespace}.${key}`;
    };
  },
  setRequestLocale: jest.fn(),
}));

jest.mock("@/components/vehicle/vehicle-hero", () => ({
  VehicleHero: ({
    vehicle,
    year,
  }: {
    vehicle: { brand: string; model: string };
    year: number;
  }) => (
    <div data-testid="vehicle-hero" data-year={String(year)}>
      {vehicle.brand} {vehicle.model}
    </div>
  ),
}));

jest.mock("@/components/vehicle/vehicle-tech-specs", () => ({
  VehicleTechSpecs: ({ vehicle }: { vehicle: { engine: string } }) => (
    <div data-testid="vehicle-tech-specs">{vehicle.engine}</div>
  ),
}));

jest.mock("@/components/vehicle/known-issues-summary", () => ({
  KnownIssuesSummary: ({ total }: { total: number }) => (
    <div data-testid="known-issues-summary">{total}</div>
  ),
}));

jest.mock("@/components/vehicle/known-issues-accordion", () => ({
  KnownIssuesAccordion: ({ knownIssues }: { knownIssues: unknown[] }) => (
    <div data-testid="known-issues-accordion">{knownIssues.length}</div>
  ),
}));

jest.mock("@/components/vehicle/vehicle-back-link", () => ({
  VehicleBackLink: () => <Link href="/">Nova busca</Link>,
}));

jest.mock("@/components/seo/page-breadcrumbs", () => ({
  PageBreadcrumbs: ({ items }: { items: { label: string }[] }) => (
    <nav data-testid="page-breadcrumbs">
      {items.map((item) => item.label).join(" > ")}
    </nav>
  ),
}));

const poloLookup: LookupResponse = {
  vehicle: {
    id: "veh-polo-6n1",
    brand: "Volkswagen",
    model: "Polo",
    name: "Polo 6N1",
    yearFrom: 1994,
    yearTo: 1999,
    engine: "1.0",
    doors: 3,
    fuelType: "gasoline",
    imageUrl: null,
    techSpecs: { power_hp: 50 },
  },
  knownIssues: [
    {
      id: "polo-6n1-gearbox-synchros",
      title: "Problematic gearbox",
      description: "Synchros wear out prematurely.",
      severity: "high",
      typicalKm: 120000,
      sources: null,
      fixes: [],
    },
    {
      id: "polo-6n1-window-regulator",
      title: "Electric window regulator failure",
      description: "The front window regulator cable can snap or jam.",
      severity: "low",
      typicalKm: 90000,
      sources: null,
      fixes: [],
    },
  ],
};

const pathParams = {
  locale: "pt-PT" as const,
  make: "volkswagen",
  model: "polo",
  year: "1996",
  fuelType: "gasoline",
  engine: "1-0",
};

describe("caching", () => {
  it("is generated on the first visit and refreshed every 3 hours", () => {
    expect(generateStaticParams()).toEqual([]);
    expect(revalidate).toBe(3 * 60 * 60);
  });
});

describe("VehiclePage", () => {
  it("renders the vehicle view with the resolved params", async () => {
    const jsx = await VehiclePage({ params: Promise.resolve(pathParams) });

    expect(jsx.type).toBe(VehiclePageView);
    expect(jsx.props).toEqual({ params: pathParams });
  });
});

describe("VehiclePageView", () => {
  afterEach(() => {
    getVehicleLookupByPathMock.mockReset();
    getCurrentUserMock.mockReset();
  });

  it("renders the hero, specs, summary and known issues for a matching vehicle", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(poloLookup);

    const jsx = await VehiclePageView({ params: pathParams });
    render(jsx);

    expect(getVehicleLookupByPathMock).toHaveBeenCalledWith({
      make: "volkswagen",
      model: "polo",
      year: 1996,
      fuelType: "gasoline",
      engine: "1-0",
      doors: undefined,
      language: "pt-PT",
    });
    expect(screen.getByTestId("vehicle-hero")).toHaveTextContent(
      "Volkswagen Polo"
    );
    expect(screen.getByTestId("vehicle-tech-specs")).toHaveTextContent("1.0");
    expect(screen.getByTestId("known-issues-summary")).toHaveTextContent("2");
    expect(screen.getByTestId("known-issues-accordion")).toHaveTextContent(
      "2"
    );
    expect(screen.getByRole("link", { name: "Nova busca" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(
      document.querySelectorAll('script[type="application/ld+json"]')
    ).toHaveLength(2);
  });

  it("never reads the session, so one cached render serves every visitor", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(poloLookup);

    const jsx = await VehiclePageView({ params: pathParams });
    render(jsx);

    expect(getCurrentUserMock).not.toHaveBeenCalled();
    expect(screen.getByTestId("vehicle-hero")).toHaveAttribute(
      "data-year",
      "1996"
    );
  });

  it("passes the es-ES locale through as the API request language", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(poloLookup);

    await VehiclePageView({
      params: { ...pathParams, locale: "es-ES" },
    });

    expect(getVehicleLookupByPathMock).toHaveBeenCalledWith(
      expect.objectContaining({ language: "es-ES" })
    );
  });

  it("shows the Mercado Livre products box on pt-BR pages", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(poloLookup);

    const jsx = await VehiclePageView({
      params: { ...pathParams, locale: "pt-BR" },
    });
    render(jsx);

    expect(
      screen.getByRole("heading", {
        name: 'faults.vehicle.mercadoLivre.title({"vehicle":"Volkswagen Polo"})',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "faults.vehicle.mercadoLivre.products.engineOil",
      })
    ).toHaveAttribute("href", expect.stringMatching(/^https:\/\/meli\.la\//));
  });

  it("does not show the Mercado Livre products box outside pt-BR", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(poloLookup);

    const jsx = await VehiclePageView({ params: pathParams });
    render(jsx);

    expect(
      screen.queryByRole("heading", {
        name: /faults\.vehicle\.mercadoLivre\.title/,
      })
    ).not.toBeInTheDocument();
  });

  it("shows a no-known-issues message and skips the FAQ structured data when there are none", async () => {
    getVehicleLookupByPathMock.mockResolvedValue({
      ...poloLookup,
      knownIssues: [],
    });

    const jsx = await VehiclePageView({
      params: {
        ...pathParams,
        make: "tesla",
        model: "model-3",
        year: "2022",
      },
    });
    render(jsx);

    expect(
      screen.getByText("faults.vehicle.noKnownIssues")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("known-issues-accordion")).not.toBeInTheDocument();
    expect(
      document.querySelectorAll('script[type="application/ld+json"]')
    ).toHaveLength(1);
  });

  it("propagates API errors instead of rendering a cacheable not-found page", async () => {
    getVehicleLookupByPathMock.mockRejectedValue(
      new Error("Failed to load vehicle lookup: 500")
    );

    await expect(
      VehiclePageView({
        params: pathParams,
      })
    ).rejects.toThrow("Failed to load vehicle lookup: 500");
  });

  it("triggers a not-found response when the lookup is not found (null)", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(null);

    await expect(
      VehiclePageView({
        params: pathParams,
      })
    ).rejects.toThrow();
  });
});

describe("generateMetadata", () => {
  const poloCatalogVehicle = {
    brand: "Volkswagen",
    model: "Polo",
    yearFrom: 1994,
    engine: "1.0",
    fuelType: "gasoline",
    locales: ["pt-BR", "pt-PT"],
  };

  beforeEach(() => {
    findCatalogVehicleMock.mockResolvedValue(poloCatalogVehicle);
  });

  afterEach(() => {
    getVehicleLookupByPathMock.mockReset();
    findCatalogVehicleMock.mockReset();
  });

  it("builds a localized title, description and canonical path for a known vehicle", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(poloLookup);

    const metadata = await generateMetadata({
      params: Promise.resolve(pathParams),
    });

    expect(metadata.title).toContain("seo.vehiclePage.titleTemplate");
    expect(metadata.description).toContain(
      "seo.vehiclePage.descriptionTemplate"
    );
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/pt-PT/defects/volkswagen/polo/1996/gasoline/1-0"
    );
  });

  it("stays indexable with hreflang only for the locales that have known issues", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(poloLookup);

    const metadata = await generateMetadata({
      params: Promise.resolve(pathParams),
    });

    expect(findCatalogVehicleMock).toHaveBeenCalledWith({
      makeSlug: "volkswagen",
      modelSlug: "polo",
      yearFrom: 1994,
      fuelType: "gasoline",
      engineSlug: "1-0",
    });
    expect(metadata.robots).toBeUndefined();
    expect(metadata.alternates?.languages).toEqual({
      "pt-PT":
        "http://localhost:3000/pt-PT/defects/volkswagen/polo/1996/gasoline/1-0",
      "pt-BR":
        "http://localhost:3000/pt-BR/defects/volkswagen/polo/1996/gasoline/1-0",
    });
  });

  it("falls back to every locale in hreflang when the vehicle isn't in the catalog", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(poloLookup);
    findCatalogVehicleMock.mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: Promise.resolve(pathParams),
    });

    expect(metadata.robots).toBeUndefined();
    expect(metadata.alternates?.languages).toHaveProperty("x-default");
  });

  it("is noindex (but followed) when there are no known issues in this locale", async () => {
    getVehicleLookupByPathMock.mockResolvedValue({
      ...poloLookup,
      knownIssues: [],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve(pathParams),
    });

    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(findCatalogVehicleMock).not.toHaveBeenCalled();
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/pt-PT/defects/volkswagen/polo/1996/gasoline/1-0"
    );
    expect(metadata.alternates?.languages).toEqual({
      "pt-PT":
        "http://localhost:3000/pt-PT/defects/volkswagen/polo/1996/gasoline/1-0",
    });
  });

  it("returns an empty object when the lookup is not found", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({
        ...pathParams,
        make: "tesla",
        model: "model-3",
        year: "2018",
      }),
    });

    expect(metadata).toEqual({});
  });
});
