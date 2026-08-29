import type { UserProfile } from "@/types/user";
import type { UserVehicle, UserVehicleDetail } from "@/types/user-vehicle";

import { getGaragePageData } from "./get-garage-page-data";

const getCurrentUserMock = jest.fn();
const getCurrentUserVehiclesMock = jest.fn();
const getCurrentUserVehicleMock = jest.fn();

jest.mock("@/lib/api/users", () => ({
  getCurrentUser: () => getCurrentUserMock(),
  getCurrentUserVehicles: (query?: unknown) =>
    getCurrentUserVehiclesMock(query),
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
    getCurrentUserVehiclesMock.mockResolvedValue({
      items: [vehicle],
      nextCursor: "c2",
    });
    getCurrentUserVehicleMock.mockResolvedValue(vehicleDetail);

    await expect(getGaragePageData("pt-PT")).resolves.toEqual({
      user,
      vehicles: [vehicle],
      nextCursor: "c2",
      selectedVehicle: vehicleDetail,
    });
    expect(getCurrentUserVehiclesMock).toHaveBeenCalledWith({
      language: "pt-PT",
      limit: 20,
    });
    expect(getCurrentUserVehicleMock).toHaveBeenCalledWith("uv-1", "pt-PT");
  });

  it("does not fetch a vehicle detail when the garage is empty", async () => {
    getCurrentUserMock.mockResolvedValue(user);
    getCurrentUserVehiclesMock.mockResolvedValue({
      items: [],
      nextCursor: null,
    });

    await expect(getGaragePageData("pt-PT")).resolves.toEqual({
      user,
      vehicles: [],
      nextCursor: null,
      selectedVehicle: null,
    });
    expect(getCurrentUserVehicleMock).not.toHaveBeenCalled();
  });

  it("fetches the vehicle list and the requested vehicle's detail in parallel when vehicleId is given", async () => {
    getCurrentUserMock.mockResolvedValue(user);
    getCurrentUserVehiclesMock.mockResolvedValue({
      items: [vehicle],
      nextCursor: null,
    });
    getCurrentUserVehicleMock.mockResolvedValue(vehicleDetail);

    await expect(getGaragePageData("pt-PT", "uv-1")).resolves.toEqual({
      user,
      vehicles: [vehicle],
      nextCursor: null,
      selectedVehicle: vehicleDetail,
    });
    expect(getCurrentUserVehiclesMock).toHaveBeenCalledWith({
      language: "pt-PT",
      limit: 20,
    });
    expect(getCurrentUserVehicleMock).toHaveBeenCalledWith("uv-1", "pt-PT");
  });

  it("returns a null selectedVehicle when the requested vehicleId does not exist", async () => {
    getCurrentUserMock.mockResolvedValue(user);
    getCurrentUserVehiclesMock.mockResolvedValue({
      items: [vehicle],
      nextCursor: null,
    });
    getCurrentUserVehicleMock.mockResolvedValue(null);

    await expect(getGaragePageData("pt-PT", "missing")).resolves.toEqual({
      user,
      vehicles: [vehicle],
      nextCursor: null,
      selectedVehicle: null,
    });
  });

  it("falls back to the default locale for an unsupported locale", async () => {
    getCurrentUserMock.mockResolvedValue(user);
    getCurrentUserVehiclesMock.mockResolvedValue({
      items: [],
      nextCursor: null,
    });

    await getGaragePageData("fr-FR");

    expect(getCurrentUserVehiclesMock).toHaveBeenCalledWith({
      language: "pt-PT",
      limit: 20,
    });
  });

  it("propagates a rejection from the vehicles list", async () => {
    getCurrentUserMock.mockResolvedValue(user);
    getCurrentUserVehiclesMock.mockRejectedValue(new Error("vehicles failed"));

    await expect(getGaragePageData("pt-PT")).rejects.toThrow(
      "vehicles failed"
    );
  });
});
