import type { UserProfile } from "@/types/user";
import type { UserStats } from "@/types/user-stats";
import type { UserVehicle } from "@/types/user-vehicle";

import { getProfilePageData } from "./get-profile-page-data";

const getCurrentUserMock = jest.fn();
const getCurrentUserStatsMock = jest.fn();
const getCurrentUserVehiclesMock = jest.fn();

jest.mock("@/lib/api/users", () => ({
  getCurrentUser: () => getCurrentUserMock(),
  getCurrentUserStats: () => getCurrentUserStatsMock(),
  getCurrentUserVehicles: (query?: unknown) =>
    getCurrentUserVehiclesMock(query),
}));

const user: UserProfile = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana Silva",
  role: "user",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const stats: UserStats = {
  searchesCount: 1,
  defectsConsultedCount: 2,
  savedVehiclesCount: 3,
  votesCount: 4,
  dislikesCount: 5,
  favoritedVehiclesCount: 6,
};

const vehicles: UserVehicle[] = [];

describe("getProfilePageData", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("returns user, stats and the first garage page when authenticated", async () => {
    getCurrentUserMock.mockResolvedValue(user);
    getCurrentUserStatsMock.mockResolvedValue(stats);
    getCurrentUserVehiclesMock.mockResolvedValue({
      items: vehicles,
      nextCursor: null,
    });

    await expect(getProfilePageData()).resolves.toEqual({
      user,
      stats,
      vehicles,
    });
    expect(getCurrentUserVehiclesMock).toHaveBeenCalledWith({ limit: 6 });
  });

  it("returns null when there is no authenticated user", async () => {
    getCurrentUserMock.mockResolvedValue(null);

    await expect(getProfilePageData()).resolves.toBeNull();
    expect(getCurrentUserStatsMock).not.toHaveBeenCalled();
    expect(getCurrentUserVehiclesMock).not.toHaveBeenCalled();
  });

  it("propagates a rejection from stats", async () => {
    getCurrentUserMock.mockResolvedValue(user);
    getCurrentUserStatsMock.mockRejectedValue(new Error("stats failed"));
    getCurrentUserVehiclesMock.mockResolvedValue({
      items: vehicles,
      nextCursor: null,
    });

    await expect(getProfilePageData()).rejects.toThrow("stats failed");
  });

  it("propagates a rejection from vehicles", async () => {
    getCurrentUserMock.mockResolvedValue(user);
    getCurrentUserStatsMock.mockResolvedValue(stats);
    getCurrentUserVehiclesMock.mockRejectedValue(new Error("vehicles failed"));

    await expect(getProfilePageData()).rejects.toThrow("vehicles failed");
  });
});
