/**
 * @jest-environment node
 */
import {
  createCurrentUserVehicle,
  deleteCurrentUserVehicle,
  getCurrentUser,
  getCurrentUserStats,
  getCurrentUserVehicle,
  getCurrentUserVehicles,
  UserVehicleConflictError,
} from "./users";

const serverApiFetchMock = jest.fn();

jest.mock("./server-client", () => ({
  serverApiFetch: (...args: unknown[]) => serverApiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("getCurrentUser", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("returns the user on a successful response", async () => {
    const user = { id: "u1", email: "a@b.com", name: "Ana", avatarUrl: null };
    serverApiFetchMock.mockResolvedValue(jsonResponse(user));

    await expect(getCurrentUser()).resolves.toEqual(user);
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/users/me");
  });

  it("returns null on a 401 response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("throws on other error responses", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(getCurrentUser()).rejects.toThrow(
      "Failed to load current user: 500"
    );
  });
});

describe("getCurrentUserStats", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("returns the stats on a successful response", async () => {
    const stats = {
      searchesCount: 1,
      defectsConsultedCount: 2,
      savedVehiclesCount: 3,
      votesCount: 4,
      dislikesCount: 5,
      favoritedVehiclesCount: 6,
    };
    serverApiFetchMock.mockResolvedValue(jsonResponse(stats));

    await expect(getCurrentUserStats()).resolves.toEqual(stats);
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/users/me/stats");
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    await expect(getCurrentUserStats()).rejects.toThrow(
      "Failed to load current user stats: 401"
    );
  });
});

describe("getCurrentUserVehicles", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("returns the vehicles on a successful response", async () => {
    const vehicles = [{ id: "uv1", brand: "Fiat", model: "Uno" }];
    serverApiFetchMock.mockResolvedValue(jsonResponse(vehicles));

    await expect(getCurrentUserVehicles()).resolves.toEqual(vehicles);
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/user-vehicles");
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(getCurrentUserVehicles()).rejects.toThrow(
      "Failed to load current user vehicles: 500"
    );
  });

  it("appends the language query param when given", async () => {
    serverApiFetchMock.mockResolvedValue(jsonResponse([]));

    await getCurrentUserVehicles("pt-PT");

    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/user-vehicles?language=pt-PT"
    );
  });
});

describe("getCurrentUserVehicle", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("returns the vehicle detail on a successful response", async () => {
    const vehicle = {
      id: "uv1",
      brand: "Fiat",
      model: "Uno",
      knownIssues: [],
    };
    serverApiFetchMock.mockResolvedValue(jsonResponse(vehicle));

    await expect(getCurrentUserVehicle("uv1")).resolves.toEqual(vehicle);
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/user-vehicles/uv1");
  });

  it("returns null on a 404 response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(getCurrentUserVehicle("missing")).resolves.toBeNull();
  });

  it("throws on other error responses", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(getCurrentUserVehicle("uv1")).rejects.toThrow(
      "Failed to load current user vehicle: 500"
    );
  });

  it("appends the language query param when given", async () => {
    serverApiFetchMock.mockResolvedValue(jsonResponse({ id: "uv1" }));

    await getCurrentUserVehicle("uv1", "pt-PT");

    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/user-vehicles/uv1?language=pt-PT"
    );
  });
});

describe("createCurrentUserVehicle", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("returns the created vehicle on a successful response", async () => {
    const vehicle = { id: "uv1", brand: "Fiat", model: "Uno", year: 2001 };
    serverApiFetchMock.mockResolvedValue(jsonResponse(vehicle));

    await expect(
      createCurrentUserVehicle({ vehicleModelId: "vm-1", year: 2001 })
    ).resolves.toEqual(vehicle);
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/user-vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleModelId: "vm-1", year: 2001 }),
    });
  });

  it("throws a UserVehicleConflictError on a 409 response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 409 }));

    await expect(
      createCurrentUserVehicle({ vehicleModelId: "vm-1", year: 2001 })
    ).rejects.toThrow(UserVehicleConflictError);
  });

  it("throws on other error responses", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(
      createCurrentUserVehicle({ vehicleModelId: "vm-1", year: 2001 })
    ).rejects.toThrow("Failed to add vehicle to garage: 500");
  });
});

describe("deleteCurrentUserVehicle", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("calls the delete endpoint on a successful response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(deleteCurrentUserVehicle("uv1")).resolves.toBeUndefined();
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/user-vehicles/uv1", {
      method: "DELETE",
    });
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(deleteCurrentUserVehicle("uv1")).rejects.toThrow(
      "Failed to delete current user vehicle: 404"
    );
  });
});
