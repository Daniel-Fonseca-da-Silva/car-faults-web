import type { UserProfile } from "@/types/user";
import type { UserVehicle, UserVehicleDetail } from "@/types/user-vehicle";

import { getGaragePageData } from "./get-garage-page-data";

const getCurrentUserMock = jest.fn();
const getCurrentUserVehiclesMock = jest.fn();
const getCurrentUserVehicleMock = jest.fn();

jest.mock("@/lib/api/users", () => ({
  getCurrentUser: () => getCurrentUserMock(),
  getCurrentUserVehicles: (language?: string) =>
    getCurrentUserVehiclesMock(language),
  getCurrentUserVehicle: (id: string, language?: string) =>
    getCurrentUserVehicleMock(id, language),
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

describe("getGaragePageData", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("returns null when there is no authenticated user", async () => {
    getCurrentUserMock.mockResolvedValue(null);

    await expect(getGaragePageData("pt-PT")).resolves.toBeNull();
    expect(getCurrentUserVehiclesMock).not.toHaveBeenCalled();
    expect(getCurrentUserVehicleMock).not.toHaveBeenCalled();
  });

  it("selects the first vehicle's detail when no vehicleId is given", async () => {
    getCurrentUserMock.mockResolvedValue(user);
    getCurrentUserVehiclesMock.mockResolvedValue([vehicle]);
    getCurrentUserVehicleMock.mockResolvedValue(vehicleDetail);

    await expect(getGaragePageData("pt-PT")).resolves.toEqual({
      user,
      vehicles: [vehicle],
      selectedVehicle: vehicleDetail,
    });
    expect(getCurrentUserVehiclesMock).toHaveBeenCalledWith("pt-PT");
    expect(getCurrentUserVehicleMock).toHaveBeenCalledWith("uv-1", "pt-PT");
  });

  it("does not fetch a vehicle detail when the garage is empty", async () => {
    getCurrentUserMock.mockResolvedValue(user);
    getCurrentUserVehiclesMock.mockResolvedValue([]);

    await expect(getGaragePageData("pt-PT")).resolves.toEqual({
      user,
      vehicles: [],
      selectedVehicle: null,
    });
    expect(getCurrentUserVehicleMock).not.toHaveBeenCalled();
  });

  it("fetches the vehicle list and the requested vehicle's detail in parallel when vehicleId is given", async () => {
    getCurrentUserMock.mockResolvedValue(user);
    getCurrentUserVehiclesMock.mockResolvedValue([vehicle]);
    getCurrentUserVehicleMock.mockResolvedValue(vehicleDetail);

    await expect(getGaragePageData("pt-PT", "uv-1")).resolves.toEqual({
      user,
      vehicles: [vehicle],
      selectedVehicle: vehicleDetail,
    });
    expect(getCurrentUserVehiclesMock).toHaveBeenCalledWith("pt-PT");
    expect(getCurrentUserVehicleMock).toHaveBeenCalledWith("uv-1", "pt-PT");
  });

  it("returns a null selectedVehicle when the requested vehicleId does not exist", async () => {
    getCurrentUserMock.mockResolvedValue(user);
    getCurrentUserVehiclesMock.mockResolvedValue([vehicle]);
    getCurrentUserVehicleMock.mockResolvedValue(null);

    await expect(getGaragePageData("pt-PT", "missing")).resolves.toEqual({
      user,
      vehicles: [vehicle],
      selectedVehicle: null,
    });
  });

  it("falls back to the default locale for an unsupported locale", async () => {
    getCurrentUserMock.mockResolvedValue(user);
    getCurrentUserVehiclesMock.mockResolvedValue([]);

    await getGaragePageData("fr-FR");

    expect(getCurrentUserVehiclesMock).toHaveBeenCalledWith("pt-PT");
  });

  it("propagates a rejection from the vehicles list", async () => {
    getCurrentUserMock.mockResolvedValue(user);
    getCurrentUserVehiclesMock.mockRejectedValue(new Error("vehicles failed"));

    await expect(getGaragePageData("pt-PT")).rejects.toThrow(
      "vehicles failed"
    );
  });
});
