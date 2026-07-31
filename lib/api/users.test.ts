/**
 * @jest-environment node
 */
import {
  getCurrentUser,
  getCurrentUserStats,
  getCurrentUserVehicles,
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
});
