/**
 * @jest-environment node
 */
import {
  favoriteVehicle,
  getVehicleFavoriteStatus,
  unfavoriteVehicle,
} from "./activity-logs";

const serverApiFetchMock = jest.fn();

jest.mock("./server-client", () => ({
  serverApiFetch: (...args: unknown[]) => serverApiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("favoriteVehicle", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("posts a vehicle_favorite activity log on a successful response", async () => {
    serverApiFetchMock.mockResolvedValue(jsonResponse({ id: "log-1" }));

    await expect(favoriteVehicle("vm-1")).resolves.toBeUndefined();
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/activity-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "vehicle_favorite", resourceId: "vm-1" }),
    });
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(favoriteVehicle("vm-1")).rejects.toThrow(
      "Failed to favorite vehicle: 500"
    );
  });
});

describe("unfavoriteVehicle", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("calls the delete favorites endpoint on a successful response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(unfavoriteVehicle("vm-1")).resolves.toBeUndefined();
    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/activity-logs/favorites/vm-1",
      { method: "DELETE" }
    );
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(unfavoriteVehicle("vm-1")).rejects.toThrow(
      "Failed to unfavorite vehicle: 404"
    );
  });
});

describe("getVehicleFavoriteStatus", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("returns the favorite status on a successful response", async () => {
    const status = { vehicleModelId: "vm-1", favorited: true };
    serverApiFetchMock.mockResolvedValue(jsonResponse(status));

    await expect(getVehicleFavoriteStatus("vm-1")).resolves.toEqual(status);
    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/activity-logs/favorites/vm-1"
    );
  });

  it("returns not favorited on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    await expect(getVehicleFavoriteStatus("vm-1")).resolves.toEqual({
      vehicleModelId: "vm-1",
      favorited: false,
    });
  });

  it("returns not favorited when the request throws", async () => {
    serverApiFetchMock.mockRejectedValue(new Error("network error"));

    await expect(getVehicleFavoriteStatus("vm-1")).resolves.toEqual({
      vehicleModelId: "vm-1",
      favorited: false,
    });
  });
});
