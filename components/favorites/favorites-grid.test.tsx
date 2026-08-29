import { render, screen, waitFor } from "@testing-library/react";

import type { FavoriteVehicle } from "@/types/favorite-vehicle";

import { FavoritesGrid } from "./favorites-grid";

const fetchFavoriteVehiclesPageMock = jest.fn();
let observerCallback: IntersectionObserverCallback | null = null;

jest.mock("@/lib/favorites/fetch-favorite-vehicles-page", () => ({
  fetchFavoriteVehiclesPage: (...args: unknown[]) =>
    fetchFavoriteVehiclesPageMock(...args),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("./favorite-vehicle-card", () => ({
  FavoriteVehicleCard: ({ vehicle }: { vehicle: FavoriteVehicle }) => (
    <div>{vehicle.brand} {vehicle.model} {vehicle.year}</div>
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

const golf: FavoriteVehicle = {
  ...polo,
  vehicleModelId: "vm-2",
  model: "Golf",
  year: 2018,
};

beforeEach(() => {
  fetchFavoriteVehiclesPageMock.mockReset();
  observerCallback = null;
  class MockIntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      observerCallback = callback;
    }
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
    takeRecords = () => [];
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
});

describe("FavoritesGrid", () => {
  it("renders the empty state when there are no favorites", () => {
    render(<FavoritesGrid initialItems={[]} initialCursor={null} />);

    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("loads the next page when the sentinel intersects, then stops", async () => {
    fetchFavoriteVehiclesPageMock.mockResolvedValue({
      items: [golf],
      nextCursor: null,
    });

    render(
      <FavoritesGrid initialItems={[polo]} initialCursor="c2" />
    );

    expect(screen.getByText("Volkswagen Polo 1996")).toBeInTheDocument();
    expect(screen.queryByText("Volkswagen Golf 2018")).not.toBeInTheDocument();

    observerCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );

    await waitFor(() => {
      expect(fetchFavoriteVehiclesPageMock).toHaveBeenCalledWith({
        cursor: "c2",
        limit: 12,
      });
    });
    expect(await screen.findByText("Volkswagen Golf 2018")).toBeInTheDocument();
  });
});
