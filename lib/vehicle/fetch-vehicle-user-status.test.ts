import { fetchVehicleUserStatus } from "./fetch-vehicle-user-status";

const apiFetchMock = jest.fn();

jest.mock("@/lib/api/client", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("fetchVehicleUserStatus", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("returns the garage entry and favorite state", async () => {
    apiFetchMock.mockImplementation((path: string) =>
      Promise.resolve(
        path.startsWith("/v1/user-vehicles/status")
          ? jsonResponse({ inGarage: true, userVehicleId: "uv-1" })
          : jsonResponse({ vehicleModelId: "vm-1", favorited: true })
      )
    );

    await expect(fetchVehicleUserStatus("vm-1", 2015)).resolves.toEqual({
      garageVehicleId: "uv-1",
      isFavorited: true,
    });
    expect(apiFetchMock).toHaveBeenCalledWith(
      "/v1/user-vehicles/status?vehicleModelId=vm-1&year=2015"
    );
    expect(apiFetchMock).toHaveBeenCalledWith(
      "/v1/activity-logs/favorites/vm-1?year=2015"
    );
  });

  it("falls back to not saved on error responses", async () => {
    apiFetchMock.mockResolvedValue(jsonResponse({}, 500));

    await expect(fetchVehicleUserStatus("vm-1", 2015)).resolves.toEqual({
      garageVehicleId: null,
      isFavorited: false,
    });
  });

  it("falls back to not saved when the requests throw", async () => {
    apiFetchMock.mockRejectedValue(new Error("network error"));

    await expect(fetchVehicleUserStatus("vm-1", 2015)).resolves.toEqual({
      garageVehicleId: null,
      isFavorited: false,
    });
  });
});
