import { render, screen } from "@testing-library/react";

import { locales } from "@/i18n/locales";
import type { AdminVehicleModel } from "@/types/admin";

import NewKnownIssuePage, {
  generateMetadata,
  generateStaticParams,
} from "./page";

const requireAdminUserMock = jest.fn();
const getAdminVehicleModelMock = jest.fn();
const redirectMock = jest.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

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

jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  redirect: (url: string) => redirectMock(url),
}));

jest.mock("@/lib/admin/require-admin-user", () => ({
  requireAdminUser: () => requireAdminUserMock(),
}));

jest.mock("@/lib/api/admin-vehicles.server", () => ({
  getAdminVehicleModel: (...args: unknown[]) =>
    getAdminVehicleModelMock(...args),
}));

jest.mock("@/components/admin/known-issue-form", () => ({
  KnownIssueForm: ({ vehicleModelId }: { vehicleModelId: string }) => (
    <div data-testid="known-issue-form">{vehicleModelId}</div>
  ),
}));

const vehicle: AdminVehicleModel = {
  id: "veh-1",
  brand: "Volkswagen",
  model: "Polo",
  name: null,
  yearFrom: 1994,
  yearTo: 1999,
  engine: "1.0",
  doors: 3,
  fuelType: "gasoline",
  imageUrl: null,
  techSpecs: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("NewKnownIssuePage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to login when the user is not an admin", async () => {
    requireAdminUserMock.mockResolvedValue(null);

    await expect(
      NewKnownIssuePage({
        params: Promise.resolve({ locale: "pt-PT", id: "veh-1" }),
      })
    ).rejects.toThrow("REDIRECT:/pt-PT/login");
    expect(getAdminVehicleModelMock).not.toHaveBeenCalled();
  });

  it("triggers a not-found response when the vehicle does not exist", async () => {
    requireAdminUserMock.mockResolvedValue({ id: "u1", role: "admin" });
    getAdminVehicleModelMock.mockResolvedValue(null);

    await expect(
      NewKnownIssuePage({
        params: Promise.resolve({ locale: "pt-PT", id: "missing" }),
      })
    ).rejects.toThrow();
  });

  it("renders the known issue form for the vehicle", async () => {
    requireAdminUserMock.mockResolvedValue({ id: "u1", role: "admin" });
    getAdminVehicleModelMock.mockResolvedValue({ vehicle, knownIssues: [] });

    const jsx = await NewKnownIssuePage({
      params: Promise.resolve({ locale: "pt-PT", id: "veh-1" }),
    });
    render(jsx);

    expect(
      screen.getByText("admin.newIssuePage.title")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'admin.newIssuePage.description({"vehicle":"Volkswagen Polo"})'
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId("known-issue-form")).toHaveTextContent(
      "veh-1"
    );
  });
});

describe("generateMetadata", () => {
  it("builds a localized title and description, and opts the page out of indexing", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT", id: "veh-1" }),
    });

    expect(metadata.title).toBe("seo.admin.title");
    expect(metadata.description).toBe("seo.admin.description");
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
