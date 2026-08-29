import { render, screen } from "@testing-library/react";
import Link from "next/link";

import type { LookupResponse } from "@/types/lookup";

import VehiclePage, { generateMetadata } from "./page";

const getVehicleLookupByPathMock = jest.fn();
const getCurrentUserMock = jest.fn();
const getGarageVehicleStatusMock = jest.fn();
const getVehicleFavoriteStatusMock = jest.fn();

jest.mock("@/lib/api/lookups", () => ({
  getVehicleLookupByPath: (...args: unknown[]) =>
    getVehicleLookupByPathMock(...args),
}));

jest.mock("@/lib/api/users", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUserMock(...args),
  getGarageVehicleStatus: (...args: unknown[]) =>
    getGarageVehicleStatusMock(...args),
}));

jest.mock("@/lib/api/activity-logs", () => ({
  getVehicleFavoriteStatus: (...args: unknown[]) =>
    getVehicleFavoriteStatusMock(...args),
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
    garageVehicleId,
    isFavorited,
  }: {
    vehicle: { brand: string; model: string };
    garageVehicleId: string | null;
    isFavorited: boolean;
  }) => (
    <div
      data-testid="vehicle-hero"
      data-garage-vehicle-id={garageVehicleId ?? ""}
      data-is-favorited={String(isFavorited)}
    >
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
  KnownIssuesAccordion: ({
    knownIssues,
    currentUser,
  }: {
    knownIssues: unknown[];
    currentUser: { name: string } | null;
  }) => (
    <div data-testid="known-issues-accordion">
      {knownIssues.length}
      {currentUser ? `:${currentUser.name}` : ""}
    </div>
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

describe("VehiclePage", () => {
  beforeEach(() => {
    getCurrentUserMock.mockResolvedValue(null);
    getGarageVehicleStatusMock.mockResolvedValue({
      vehicleModelId: "veh-polo-6n1",
      year: 1996,
      inGarage: false,
      userVehicleId: null,
    });
    getVehicleFavoriteStatusMock.mockResolvedValue({
      vehicleModelId: "veh-polo-6n1",
      favorited: false,
    });
  });

  afterEach(() => {
    getVehicleLookupByPathMock.mockReset();
    getCurrentUserMock.mockReset();
    getGarageVehicleStatusMock.mockReset();
    getVehicleFavoriteStatusMock.mockReset();
  });

  it("renders the hero, specs, summary and known issues for a matching vehicle", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(poloLookup);

    const jsx = await VehiclePage({
      params: Promise.resolve(pathParams),
      searchParams: Promise.resolve({}),
    });
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

  it("passes the current user through to the known issues accordion", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(poloLookup);
    getCurrentUserMock.mockResolvedValue({
      id: "u1",
      name: "Ana Silva",
      email: "ana@example.com",
      role: "user",
      avatarUrl: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const jsx = await VehiclePage({
      params: Promise.resolve(pathParams),
      searchParams: Promise.resolve({}),
    });
    render(jsx);

    expect(screen.getByTestId("known-issues-accordion")).toHaveTextContent(
      "2:Ana Silva"
    );
  });

  it("does not fetch garage or favorite state for guests", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(poloLookup);

    await VehiclePage({
      params: Promise.resolve(pathParams),
      searchParams: Promise.resolve({}),
    });

    expect(getGarageVehicleStatusMock).not.toHaveBeenCalled();
    expect(getVehicleFavoriteStatusMock).not.toHaveBeenCalled();
  });

  it("uses the point garage status and favorite status with year for a logged-in user", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(poloLookup);
    getCurrentUserMock.mockResolvedValue({
      id: "u1",
      name: "Ana Silva",
      email: "ana@example.com",
      role: "user",
      avatarUrl: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    getGarageVehicleStatusMock.mockResolvedValue({
      vehicleModelId: "veh-polo-6n1",
      year: 1996,
      inGarage: true,
      userVehicleId: "uv-match",
    });
    getVehicleFavoriteStatusMock.mockResolvedValue({
      vehicleModelId: "veh-polo-6n1",
      favorited: true,
    });

    const jsx = await VehiclePage({
      params: Promise.resolve(pathParams),
      searchParams: Promise.resolve({}),
    });
    render(jsx);

    expect(getGarageVehicleStatusMock).toHaveBeenCalledWith(
      "veh-polo-6n1",
      1996
    );
    expect(getVehicleFavoriteStatusMock).toHaveBeenCalledWith(
      "veh-polo-6n1",
      1996
    );
    const hero = screen.getByTestId("vehicle-hero");
    expect(hero).toHaveAttribute("data-garage-vehicle-id", "uv-match");
    expect(hero).toHaveAttribute("data-is-favorited", "true");
  });

  it("leaves the garage vehicle id null when no saved vehicle matches the year", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(poloLookup);
    getCurrentUserMock.mockResolvedValue({
      id: "u1",
      name: "Ana Silva",
      email: "ana@example.com",
      role: "user",
      avatarUrl: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    getGarageVehicleStatusMock.mockResolvedValue({
      vehicleModelId: "veh-polo-6n1",
      year: 1996,
      inGarage: false,
      userVehicleId: null,
    });

    const jsx = await VehiclePage({
      params: Promise.resolve(pathParams),
      searchParams: Promise.resolve({}),
    });
    render(jsx);

    expect(screen.getByTestId("vehicle-hero")).toHaveAttribute(
      "data-garage-vehicle-id",
      ""
    );
  });

  it("passes the es-ES locale through as the API request language", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(poloLookup);

    await VehiclePage({
      params: Promise.resolve({ ...pathParams, locale: "es-ES" }),
      searchParams: Promise.resolve({}),
    });

    expect(getVehicleLookupByPathMock).toHaveBeenCalledWith(
      expect.objectContaining({ language: "es-ES" })
    );
  });

  it("passes doors through when present in the query", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(poloLookup);

    await VehiclePage({
      params: Promise.resolve(pathParams),
      searchParams: Promise.resolve({ doors: "3" }),
    });

    expect(getVehicleLookupByPathMock).toHaveBeenCalledWith(
      expect.objectContaining({ doors: 3 })
    );
  });

  it("shows a no-known-issues message and skips the FAQ structured data when there are none", async () => {
    getVehicleLookupByPathMock.mockResolvedValue({
      ...poloLookup,
      knownIssues: [],
    });

    const jsx = await VehiclePage({
      params: Promise.resolve({
        ...pathParams,
        make: "tesla",
        model: "model-3",
        year: "2022",
      }),
      searchParams: Promise.resolve({}),
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

  it("triggers a not-found response when the API returns an error", async () => {
    getVehicleLookupByPathMock.mockRejectedValue(
      new Error("Failed to load vehicle lookup: 500")
    );

    await expect(
      VehiclePage({
        params: Promise.resolve(pathParams),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow();
  });

  it("triggers a not-found response when the lookup is not found (null)", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(null);

    await expect(
      VehiclePage({
        params: Promise.resolve(pathParams),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow();
  });
});

describe("generateMetadata", () => {
  afterEach(() => {
    getVehicleLookupByPathMock.mockReset();
  });

  it("builds a localized title, description and canonical path for a known vehicle", async () => {
    getVehicleLookupByPathMock.mockResolvedValue(poloLookup);

    const metadata = await generateMetadata({
      params: Promise.resolve(pathParams),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.title).toContain("seo.vehiclePage.titleTemplate");
    expect(metadata.description).toContain(
      "seo.vehiclePage.descriptionTemplate"
    );
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/pt-PT/defects/volkswagen/polo/1996/gasoline/1-0"
    );
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
      searchParams: Promise.resolve({}),
    });

    expect(metadata).toEqual({});
  });
});
