import { render, screen } from "@testing-library/react";

import type { UserStats } from "@/types/user-stats";
import type { UserVehicle } from "@/types/user-vehicle";

import { ProfileDashboard } from "./profile-dashboard";

jest.mock("@/components/profile/profile-stats-grid", () => ({
  ProfileStatsGrid: ({ stats }: { stats: UserStats }) => (
    <div data-testid="stats-grid">{stats.searchesCount}</div>
  ),
}));

jest.mock("@/components/profile/profile-saved-vehicles", () => ({
  ProfileSavedVehicles: ({ vehicles }: { vehicles: UserVehicle[] }) => (
    <div data-testid="saved-vehicles">{vehicles.length}</div>
  ),
}));

jest.mock("@/components/profile/profile-danger-zone", () => ({
  ProfileDangerZone: () => <div data-testid="danger-zone" />,
}));

const stats: UserStats = {
  searchesCount: 47,
  defectsConsultedCount: 128,
  savedVehiclesCount: 1,
  votesCount: 23,
  dislikesCount: 4,
  favoritedVehiclesCount: 2,
};

const vehicles: UserVehicle[] = [
  {
    id: "uv-polo",
    vehicleModelId: "veh-polo-6n1",
    brand: "Volkswagen",
    model: "Polo",
    year: 1996,
    engine: "1.0",
    name: "Polo 6N1",
    doors: 3,
    fuelType: "gasoline",
    imageUrl: null,
    createdAt: "2026-01-12T09:30:00.000Z",
    updatedAt: "2026-01-12T09:30:00.000Z",
    knownIssuesCount: 2,
  },
];

describe("ProfileDashboard", () => {
  it("renders the stats grid, saved vehicles and danger zone", () => {
    render(<ProfileDashboard stats={stats} vehicles={vehicles} />);

    expect(screen.getByTestId("stats-grid")).toHaveTextContent("47");
    expect(screen.getByTestId("saved-vehicles")).toHaveTextContent("1");
    expect(screen.getByTestId("danger-zone")).toBeInTheDocument();
  });
});
