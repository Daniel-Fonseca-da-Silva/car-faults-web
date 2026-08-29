import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { locales } from "@/i18n/locales";
import type { AdminVehicleModel } from "@/types/admin";

import AdminVehiclesPage, {
  generateMetadata,
  generateStaticParams,
} from "./page";

const requireAdminUserMock = jest.fn();
const getAdminVehicleModelsMock = jest.fn();
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
  redirect: (url: string) => redirectMock(url),
}));

jest.mock("@/lib/admin/require-admin-user", () => ({
  requireAdminUser: () => requireAdminUserMock(),
}));

jest.mock("@/lib/api/admin-vehicles.server", () => ({
  getAdminVehicleModels: (...args: unknown[]) =>
    getAdminVehicleModelsMock(...args),
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

jest.mock("@/components/admin/admin-vehicles-table", () => ({
  AdminVehiclesTable: ({
    initialItems,
    initialCursor,
  }: {
    initialItems: AdminVehicleModel[];
    initialCursor: string | null;
  }) => (
    <div data-testid="admin-vehicles-table">
      {initialItems.map((vehicle) => vehicle.brand).join(",")}:
      {initialCursor ?? "end"}
    </div>
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

describe("AdminVehiclesPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to login when the user is not an admin", async () => {
    requireAdminUserMock.mockResolvedValue(null);

    await expect(
      AdminVehiclesPage({
        params: Promise.resolve({ locale: "pt-PT" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("REDIRECT:/pt-PT/login");
    expect(getAdminVehicleModelsMock).not.toHaveBeenCalled();
  });

  it("renders the vehicle table and forwards the filters to the loader", async () => {
    requireAdminUserMock.mockResolvedValue({ id: "u1", role: "admin" });
    getAdminVehicleModelsMock.mockResolvedValue({
      items: [vehicle],
      nextCursor: "c2",
    });

    const jsx = await AdminVehiclesPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({ brand: "Volkswagen", model: "Polo" }),
    });
    render(jsx);

    expect(getAdminVehicleModelsMock).toHaveBeenCalledWith({
      limit: 20,
      brand: "Volkswagen",
      model: "Polo",
    });
    expect(screen.getByTestId("admin-vehicles-table")).toHaveTextContent(
      "Volkswagen:c2"
    );
  });

  it("shows the empty table state when there are no vehicles", async () => {
    requireAdminUserMock.mockResolvedValue({ id: "u1", role: "admin" });
    getAdminVehicleModelsMock.mockResolvedValue({
      items: [],
      nextCursor: null,
    });

    const jsx = await AdminVehiclesPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });
    render(jsx);

    expect(screen.getByTestId("admin-vehicles-table")).toHaveTextContent(
      ":end"
    );
  });

  it("does not render prev/next pagination controls", async () => {
    requireAdminUserMock.mockResolvedValue({ id: "u1", role: "admin" });
    getAdminVehicleModelsMock.mockResolvedValue({
      items: [vehicle],
      nextCursor: "c2",
    });

    const jsx = await AdminVehiclesPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });
    render(jsx);

    expect(
      screen.queryByRole("button", { name: "admin.vehicles.previous" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "admin.vehicles.next" })
    ).not.toBeInTheDocument();
  });
});

describe("generateMetadata", () => {
  it("builds a localized title and description, and opts the page out of indexing", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
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
