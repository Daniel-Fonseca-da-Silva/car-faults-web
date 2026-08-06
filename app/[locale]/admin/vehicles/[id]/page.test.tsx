import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { locales } from "@/i18n/locales";
import type { AdminKnownIssue, AdminVehicleModel } from "@/types/admin";

import AdminVehicleDetailPage, {
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
    return (key: string) => `${namespace}.${key}`;
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

jest.mock("@/lib/api/admin-vehicles", () => ({
  getAdminVehicleModel: (...args: unknown[]) =>
    getAdminVehicleModelMock(...args),
}));

jest.mock("@/components/admin/vehicle-model-form", () => ({
  VehicleModelForm: () => <div data-testid="vehicle-model-form" />,
}));

jest.mock("@/components/admin/vehicle-delete-button", () => ({
  VehicleDeleteButton: ({ vehicleLabel }: { vehicleLabel: string }) => (
    <div data-testid="vehicle-delete-button">{vehicleLabel}</div>
  ),
}));

jest.mock("@/components/admin/known-issue-delete-button", () => ({
  KnownIssueDeleteButton: ({ issueTitle }: { issueTitle: string }) => (
    <div data-testid="known-issue-delete-button">{issueTitle}</div>
  ),
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

const knownIssue: AdminKnownIssue = {
  id: "issue-1",
  vehicleModelId: "veh-1",
  title: "Gearbox synchros wear out",
  description: "Synchros wear out prematurely.",
  severity: "high",
  locale: "en-GB",
  typicalKm: 120000,
  sources: null,
  aiGeneratedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("AdminVehicleDetailPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to login when the user is not an admin", async () => {
    requireAdminUserMock.mockResolvedValue(null);

    await expect(
      AdminVehicleDetailPage({
        params: Promise.resolve({ locale: "pt-PT", id: "veh-1" }),
      })
    ).rejects.toThrow("REDIRECT:/pt-PT/login");
    expect(getAdminVehicleModelMock).not.toHaveBeenCalled();
  });

  it("triggers a not-found response when the vehicle does not exist", async () => {
    requireAdminUserMock.mockResolvedValue({ id: "u1", role: "admin" });
    getAdminVehicleModelMock.mockResolvedValue(null);

    await expect(
      AdminVehicleDetailPage({
        params: Promise.resolve({ locale: "pt-PT", id: "missing" }),
      })
    ).rejects.toThrow();
  });

  it("renders the vehicle form and known issues", async () => {
    requireAdminUserMock.mockResolvedValue({ id: "u1", role: "admin" });
    getAdminVehicleModelMock.mockResolvedValue({
      vehicle,
      knownIssues: [knownIssue],
    });

    const jsx = await AdminVehicleDetailPage({
      params: Promise.resolve({ locale: "pt-PT", id: "veh-1" }),
    });
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "Volkswagen Polo" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("vehicle-model-form")).toBeInTheDocument();
    expect(screen.getByTestId("vehicle-delete-button")).toHaveTextContent(
      "Volkswagen Polo"
    );
    expect(
      screen.getByRole("link", { name: "Gearbox synchros wear out" })
    ).toHaveAttribute("href", "/admin/issues/issue-1");
    expect(screen.getByTestId("known-issue-delete-button")).toHaveTextContent(
      "Gearbox synchros wear out"
    );
  });

  it("shows the empty state when there are no known issues", async () => {
    requireAdminUserMock.mockResolvedValue({ id: "u1", role: "admin" });
    getAdminVehicleModelMock.mockResolvedValue({
      vehicle,
      knownIssues: [],
    });

    const jsx = await AdminVehicleDetailPage({
      params: Promise.resolve({ locale: "pt-PT", id: "veh-1" }),
    });
    render(jsx);

    expect(
      screen.getByText("admin.vehicleDetail.noIssues")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("known-issue-delete-button")
    ).not.toBeInTheDocument();
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
