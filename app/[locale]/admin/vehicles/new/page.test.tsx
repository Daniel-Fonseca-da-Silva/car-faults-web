import { render, screen } from "@testing-library/react";

import { locales } from "@/i18n/locales";

import NewVehiclePage, {
  generateMetadata,
  generateStaticParams,
} from "./page";

const requireAdminUserMock = jest.fn();
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

jest.mock("@/lib/admin/require-admin-user", () => ({
  requireAdminUser: () => requireAdminUserMock(),
}));

jest.mock("@/components/admin/vehicle-model-form", () => ({
  VehicleModelForm: () => <div data-testid="vehicle-model-form" />,
}));

describe("NewVehiclePage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the new vehicle form for an admin user", async () => {
    requireAdminUserMock.mockResolvedValue({ id: "u1", role: "admin" });

    const jsx = await NewVehiclePage({
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    expect(
      screen.getByText("admin.newVehiclePage.title")
    ).toBeInTheDocument();
    expect(screen.getByTestId("vehicle-model-form")).toBeInTheDocument();
  });

  it("redirects to login when the user is not an admin", async () => {
    requireAdminUserMock.mockResolvedValue(null);

    await expect(
      NewVehiclePage({ params: Promise.resolve({ locale: "pt-PT" }) })
    ).rejects.toThrow("REDIRECT:/pt-PT/login");
  });
});

describe("generateMetadata", () => {
  it("builds a localized title and description, and opts the page out of indexing", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT" }),
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
