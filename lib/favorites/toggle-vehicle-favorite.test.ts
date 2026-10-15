/**
 * @jest-environment node
 */
import {
  favoriteVehicleAction,
  unfavoriteVehicleAction,
} from "./toggle-vehicle-favorite";

const favoriteVehicleMock = jest.fn();
const unfavoriteVehicleMock = jest.fn();
const revalidatePathMock = jest.fn();

jest.mock("@/lib/api/activity-logs", () => ({
  favoriteVehicle: (vehicleModelId: string, year: number) =>
    favoriteVehicleMock(vehicleModelId, year),
  unfavoriteVehicle: (vehicleModelId: string, year: number) =>
    unfavoriteVehicleMock(vehicleModelId, year),
}));

jest.mock("next/cache", () => ({
  revalidatePath: (path: string) => revalidatePathMock(path),
}));

describe("favoriteVehicleAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("favorites the vehicle with year and revalidates profile and favorites only", async () => {
    favoriteVehicleMock.mockResolvedValue(undefined);

    await favoriteVehicleAction(
      "pt-PT",
      "vm-1",
      1996
    );

    expect(favoriteVehicleMock).toHaveBeenCalledWith("vm-1", 1996);
    expect(revalidatePathMock).toHaveBeenCalledWith("/pt-PT/profile");
    expect(revalidatePathMock).toHaveBeenCalledWith("/pt-PT/favorites");
    expect(revalidatePathMock).not.toHaveBeenCalledWith(
      expect.stringContaining("/defects/")
    );
  });

  it("does not revalidate when favoriting fails", async () => {
    favoriteVehicleMock.mockRejectedValue(new Error("failed"));

    await expect(
      favoriteVehicleAction("pt-PT", "vm-1", 1996)
    ).rejects.toThrow("failed");

    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});

describe("unfavoriteVehicleAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("unfavorites the vehicle with year and revalidates profile and favorites only", async () => {
    unfavoriteVehicleMock.mockResolvedValue(undefined);

    await unfavoriteVehicleAction(
      "pt-PT",
      "vm-1",
      1996
    );

    expect(unfavoriteVehicleMock).toHaveBeenCalledWith("vm-1", 1996);
    expect(revalidatePathMock).toHaveBeenCalledWith("/pt-PT/profile");
    expect(revalidatePathMock).toHaveBeenCalledWith("/pt-PT/favorites");
    expect(revalidatePathMock).not.toHaveBeenCalledWith(
      expect.stringContaining("/defects/")
    );
  });

  it("does not revalidate when unfavoriting fails", async () => {
    unfavoriteVehicleMock.mockRejectedValue(new Error("failed"));

    await expect(
      unfavoriteVehicleAction(
        "pt-PT",
        "vm-1",
        1996
      )
    ).rejects.toThrow("failed");

    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
