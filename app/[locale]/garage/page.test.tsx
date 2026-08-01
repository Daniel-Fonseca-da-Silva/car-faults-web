import { render, screen } from "@testing-library/react";

import { locales } from "@/i18n/locales";
import type { UserProfile } from "@/types/user";
import type { UserVehicle, UserVehicleDetail } from "@/types/user-vehicle";

import GaragePage, { generateMetadata, generateStaticParams } from "./page";

const getGaragePageDataMock = jest.fn();
const redirectMock = jest.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

jest.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { namespace: string }) => {
    const namespace = typeof arg === "string" ? arg : arg.namespace;
    return (key: string) => `${namespace}.${key}`;
  },
  setRequestLocale: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

jest.mock("@/lib/garage/get-garage-page-data", () => ({
  getGaragePageData: (locale: string, vehicleId?: string) =>
    getGaragePageDataMock(locale, vehicleId),
}));

jest.mock("@/components/garage/garage-hero", () => ({
  GarageHero: ({ vehicle }: { vehicle: UserVehicleDetail | null }) => (
    <div>GarageHero:{vehicle ? vehicle.id : "none"}</div>
  ),
}));

jest.mock("@/components/garage/garage-vehicle-list", () => ({
  GarageVehicleList: ({
    vehicles,
    selectedVehicleId,
  }: {
    vehicles: UserVehicle[];
    selectedVehicleId: string | null;
  }) => (
    <div>
      GarageVehicleList:{vehicles.length}:{selectedVehicleId ?? "none"}
    </div>
  ),
}));

jest.mock("@/components/garage/garage-known-issues", () => ({
  GarageKnownIssues: ({ vehicle }: { vehicle: UserVehicleDetail }) => (
    <div>GarageKnownIssues:{vehicle.id}</div>
  ),
}));

jest.mock("@/components/ads/adsense-unit", () => ({
  AdSenseUnit: ({ slot }: { slot: string }) => <div>AdSenseUnit:{slot}</div>,
}));

const user: UserProfile = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana Silva",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const vehicle: UserVehicle = {
  id: "uv-1",
  vehicleModelId: "vm-1",
  brand: "Volkswagen",
  model: "Polo",
  year: 2001,
  engine: "1.0",
  name: null,
  doors: 3,
  fuelType: "gasoline",
  imageUrl: null,
  knownIssuesCount: 2,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const vehicleDetail: UserVehicleDetail = { ...vehicle, knownIssues: [] };

describe("GaragePage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the hero, list and issues panel with an ad when there are vehicles", async () => {
    getGaragePageDataMock.mockResolvedValue({
      user,
      vehicles: [vehicle],
      selectedVehicle: vehicleDetail,
    });

    const jsx = await GaragePage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });
    render(jsx);

    expect(screen.getByText("GarageHero:uv-1")).toBeInTheDocument();
    expect(screen.getByText("GarageVehicleList:1:uv-1")).toBeInTheDocument();
    expect(screen.getByText("GarageKnownIssues:uv-1")).toBeInTheDocument();
    expect(screen.getByText("AdSenseUnit:0000000000")).toBeInTheDocument();
  });

  it("passes the vehicleId search param through to the loader", async () => {
    getGaragePageDataMock.mockResolvedValue({
      user,
      vehicles: [vehicle],
      selectedVehicle: vehicleDetail,
    });

    await GaragePage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({ vehicleId: "uv-1" }),
    });

    expect(getGaragePageDataMock).toHaveBeenCalledWith("pt-PT", "uv-1");
  });

  it("omits the issues panel and the ad when the garage is empty", async () => {
    getGaragePageDataMock.mockResolvedValue({
      user,
      vehicles: [],
      selectedVehicle: null,
    });

    const jsx = await GaragePage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });
    render(jsx);

    expect(screen.getByText("GarageHero:none")).toBeInTheDocument();
    expect(screen.getByText("GarageVehicleList:0:none")).toBeInTheDocument();
    expect(screen.queryByText(/GarageKnownIssues/)).not.toBeInTheDocument();
    expect(screen.queryByText(/AdSenseUnit/)).not.toBeInTheDocument();
  });

  it("redirects to login when there is no authenticated user", async () => {
    getGaragePageDataMock.mockResolvedValue(null);

    await expect(
      GaragePage({
        params: Promise.resolve({ locale: "pt-PT" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("REDIRECT:/pt-PT/login");
  });
});

describe("generateMetadata", () => {
  it("builds a localized title and description, and opts the page out of indexing", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.title).toBe("seo.garage.title");
    expect(metadata.description).toBe("seo.garage.description");
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});

describe("generateStaticParams", () => {
  it("returns a param entry for every supported locale", () => {
    expect(generateStaticParams()).toEqual(
      locales.map((locale) => ({ locale }))
    );
  });
});
