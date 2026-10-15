import { fetchCurrentUser } from "./fetch-current-user";

const user = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana Silva",
  role: "user",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("fetchCurrentUser", () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns the user from the session endpoint, bypassing the cache", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ user }));

    await expect(fetchCurrentUser()).resolves.toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/me", {
      cache: "no-store",
    });
  });

  it("returns null when signed out", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ user: null }));

    await expect(fetchCurrentUser()).resolves.toBeNull();
  });

  it("returns null on an error response", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 500));

    await expect(fetchCurrentUser()).resolves.toBeNull();
  });

  it("returns null when the request throws", async () => {
    fetchMock.mockRejectedValue(new Error("network error"));

    await expect(fetchCurrentUser()).resolves.toBeNull();
  });
});
