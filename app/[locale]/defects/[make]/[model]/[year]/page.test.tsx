import { render, screen } from "@testing-library/react";
import Link from "next/link";

import type { LookupResponse } from "@/types/lookup";

import VehiclePage, { generateMetadata } from "./page";

const getVehicleLookupMock = jest.fn();
const getCurrentUserMock = jest.fn();
const getCurrentUserVehiclesMock = jest.fn();
const getVehicleFavoriteStatusMock = jest.fn();

jest.mock("@/lib/api/lookups", () => ({
  getVehicleLookup: (...args: unknown[]) => getVehicleLookupMock(...args),
}));

jest.mock("@/lib/api/users", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUserMock(...args),
  getCurrentUserVehicles: (...args: unknown[]) =>
    getCurrentUserVehiclesMock(...args),
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

jest.mock("@/components/ads/adsense-unit", () => ({
  AdSenseUnit: ({ slot }: { slot: string }) => (
    <div data-testid="adsense-unit">{slot}</div>
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

const validSearchParams = {
  brand: "Volkswagen",
  model: "Polo",
  engine: "1.0",
  fuelType: "gasoline",
};

describe("VehiclePage", () => {
  beforeEach(() => {
    getCurrentUserMock.mockResolvedValue(null);
    getCurrentUserVehiclesMock.mockResolvedValue([]);
    getVehicleFavoriteStatusMock.mockResolvedValue({
      vehicleModelId: "veh-polo-6n1",
      favorited: false,
    });
  });

  afterEach(() => {
    getVehicleLookupMock.mockReset();
    getCurrentUserMock.mockReset();
    getCurrentUserVehiclesMock.mockReset();
    getVehicleFavoriteStatusMock.mockReset();
  });

  it("renders the hero, specs, summary and known issues for a matching vehicle", async () => {
    getVehicleLookupMock.mockResolvedValue(poloLookup);

    const jsx = await VehiclePage({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "volkswagen",
        model: "polo",
        year: "1996",
      }),
      searchParams: Promise.resolve(validSearchParams),
    });
    render(jsx);

    expect(getVehicleLookupMock).toHaveBeenCalledWith({
      brand: "Volkswagen",
      model: "Polo",
      year: 1996,
      engine: "1.0",
      fuelType: "gasoline",
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
    getVehicleLookupMock.mockResolvedValue(poloLookup);
    getCurrentUserMock.mockResolvedValue({
      id: "u1",
      name: "Ana Silva",
      email: "ana@example.com",
      avatarUrl: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const jsx = await VehiclePage({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "volkswagen",
        model: "polo",
        year: "1996",
      }),
      searchParams: Promise.resolve(validSearchParams),
    });
    render(jsx);

    expect(screen.getByTestId("known-issues-accordion")).toHaveTextContent(
      "2:Ana Silva"
    );
  });

  it("does not fetch garage or favorite state for guests", async () => {
    getVehicleLookupMock.mockResolvedValue(poloLookup);

    await VehiclePage({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "volkswagen",
        model: "polo",
        year: "1996",
      }),
      searchParams: Promise.resolve(validSearchParams),
    });

    expect(getCurrentUserVehiclesMock).not.toHaveBeenCalled();
    expect(getVehicleFavoriteStatusMock).not.toHaveBeenCalled();
  });

  it("matches the garage vehicle by vehicle model id and year, and passes the favorite status for a logged-in user", async () => {
    getVehicleLookupMock.mockResolvedValue(poloLookup);
    getCurrentUserMock.mockResolvedValue({
      id: "u1",
      name: "Ana Silva",
      email: "ana@example.com",
      avatarUrl: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    getCurrentUserVehiclesMock.mockResolvedValue([
      { id: "uv-other", vehicleModelId: "veh-polo-6n1", year: 1994 },
      { id: "uv-match", vehicleModelId: "veh-polo-6n1", year: 1996 },
    ]);
    getVehicleFavoriteStatusMock.mockResolvedValue({
      vehicleModelId: "veh-polo-6n1",
      favorited: true,
    });

    const jsx = await VehiclePage({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "volkswagen",
        model: "polo",
        year: "1996",
      }),
      searchParams: Promise.resolve(validSearchParams),
    });
    render(jsx);

    expect(getVehicleFavoriteStatusMock).toHaveBeenCalledWith(
      "veh-polo-6n1"
    );
    const hero = screen.getByTestId("vehicle-hero");
    expect(hero).toHaveAttribute("data-garage-vehicle-id", "uv-match");
    expect(hero).toHaveAttribute("data-is-favorited", "true");
  });

  it("leaves the garage vehicle id null when no saved vehicle matches the year", async () => {
    getVehicleLookupMock.mockResolvedValue(poloLookup);
    getCurrentUserMock.mockResolvedValue({
      id: "u1",
      name: "Ana Silva",
      email: "ana@example.com",
      avatarUrl: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    getCurrentUserVehiclesMock.mockResolvedValue([
      { id: "uv-other", vehicleModelId: "veh-polo-6n1", year: 1994 },
    ]);

    const jsx = await VehiclePage({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "volkswagen",
        model: "polo",
        year: "1996",
      }),
      searchParams: Promise.resolve(validSearchParams),
    });
    render(jsx);

    expect(screen.getByTestId("vehicle-hero")).toHaveAttribute(
      "data-garage-vehicle-id",
      ""
    );
  });

  it("passes the es-ES locale through as the API request language", async () => {
    getVehicleLookupMock.mockResolvedValue(poloLookup);

    await VehiclePage({
      params: Promise.resolve({
        locale: "es-ES",
        make: "volkswagen",
        model: "polo",
        year: "1996",
      }),
      searchParams: Promise.resolve(validSearchParams),
    });

    expect(getVehicleLookupMock).toHaveBeenCalledWith(
      expect.objectContaining({ language: "es-ES" })
    );
  });

  it("passes doors through when present in the query", async () => {
    getVehicleLookupMock.mockResolvedValue(poloLookup);

    await VehiclePage({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "volkswagen",
        model: "polo",
        year: "1996",
      }),
      searchParams: Promise.resolve({ ...validSearchParams, doors: "3" }),
    });

    expect(getVehicleLookupMock).toHaveBeenCalledWith(
      expect.objectContaining({ doors: 3 })
    );
  });

  it("shows a no-known-issues message and skips the FAQ structured data when there are none", async () => {
    getVehicleLookupMock.mockResolvedValue({
      ...poloLookup,
      knownIssues: [],
    });

    const jsx = await VehiclePage({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "tesla",
        model: "model-3",
        year: "2022",
      }),
      searchParams: Promise.resolve(validSearchParams),
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

  it("triggers a not-found response when required query fields are missing", async () => {
    await expect(
      VehiclePage({
        params: Promise.resolve({
          locale: "pt-PT",
          make: "tesla",
          model: "model-3",
          year: "2018",
        }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow();

    expect(getVehicleLookupMock).not.toHaveBeenCalled();
  });

  it("triggers a not-found response when the API returns an error", async () => {
    getVehicleLookupMock.mockRejectedValue(new Error("Failed to load vehicle lookup: 500"));

    await expect(
      VehiclePage({
        params: Promise.resolve({
          locale: "pt-PT",
          make: "tesla",
          model: "model-3",
          year: "2018",
        }),
        searchParams: Promise.resolve(validSearchParams),
      })
    ).rejects.toThrow();
  });

  it("triggers a not-found response when the lookup is not found (null)", async () => {
    getVehicleLookupMock.mockResolvedValue(null);

    await expect(
      VehiclePage({
        params: Promise.resolve({
          locale: "pt-PT",
          make: "tesla",
          model: "model-3",
          year: "2018",
        }),
        searchParams: Promise.resolve(validSearchParams),
      })
    ).rejects.toThrow();
  });
});

describe("generateMetadata", () => {
  afterEach(() => {
    getVehicleLookupMock.mockReset();
  });

  it("builds a localized title and description for a known vehicle", async () => {
    getVehicleLookupMock.mockResolvedValue(poloLookup);

    const metadata = await generateMetadata({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "volkswagen",
        model: "polo",
        year: "1996",
      }),
      searchParams: Promise.resolve(validSearchParams),
    });

    expect(metadata.title).toContain("seo.vehiclePage.titleTemplate");
    expect(metadata.description).toContain(
      "seo.vehiclePage.descriptionTemplate"
    );
  });

  it("returns an empty object when the query is missing required fields", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "tesla",
        model: "model-3",
        year: "2018",
      }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata).toEqual({});
    expect(getVehicleLookupMock).not.toHaveBeenCalled();
  });
});
