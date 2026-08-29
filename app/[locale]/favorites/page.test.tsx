import { render, screen } from "@testing-library/react";

import { locales } from "@/i18n/locales";
import type { FavoriteVehicle } from "@/types/favorite-vehicle";

import FavoritesPage, { generateMetadata, generateStaticParams } from "./page";

const getCurrentUserMock = jest.fn();
const getFavoriteVehiclesMock = jest.fn();
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

jest.mock("@/lib/api/users", () => ({
  getCurrentUser: () => getCurrentUserMock(),
}));

jest.mock("@/lib/api/activity-logs", () => ({
  getFavoriteVehicles: (...args: unknown[]) => getFavoriteVehiclesMock(...args),
}));

jest.mock("@/components/favorites/favorites-grid", () => ({
  FavoritesGrid: ({
    initialItems,
    initialCursor,
  }: {
    initialItems: FavoriteVehicle[];
    initialCursor: string | null;
  }) => (
    <div data-testid="favorites-grid">
      {initialItems.length}:{initialCursor ?? "end"}
    </div>
  ),
}));

const polo: FavoriteVehicle = {
  vehicleModelId: "vm-1",
  brand: "Volkswagen",
  model: "Polo",
  engine: "1.0",
  fuelType: "gasoline",
  doors: 3,
  imageUrl: null,
  year: 1996,
};

describe("FavoritesPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to login when there is no authenticated user", async () => {
    getCurrentUserMock.mockResolvedValue(null);

    await expect(
      FavoritesPage({ params: Promise.resolve({ locale: "pt-PT" }) })
    ).rejects.toThrow("REDIRECT:/pt-PT/login");
    expect(getFavoriteVehiclesMock).not.toHaveBeenCalled();
  });

  it("renders the first favorites page for a signed-in user", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "u1" });
    getFavoriteVehiclesMock.mockResolvedValue({
      items: [polo],
      nextCursor: "c2",
    });

    const jsx = await FavoritesPage({
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    expect(getFavoriteVehiclesMock).toHaveBeenCalledWith({ limit: 12 });
    expect(
      screen.getByRole("heading", { name: "favorites.title" })
    ).toBeInTheDocument();
    expect(screen.getByText("favorites.subtitle")).toBeInTheDocument();
    expect(screen.getByTestId("favorites-grid")).toHaveTextContent("1:c2");
  });
});

describe("generateMetadata", () => {
  it("builds a localized title and description, and opts the page out of indexing", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT" }),
    });

    expect(metadata.title).toBe("seo.favorites.title");
    expect(metadata.description).toBe("seo.favorites.description");
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
