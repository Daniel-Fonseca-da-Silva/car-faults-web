/**
 * @jest-environment node
 */
const apiFetchMock = jest.fn();

jest.mock("@/lib/api/client", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe("logout", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(new Response(null, { status: 204 }));
    global.fetch = fetchMock;
    apiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("logs out from the API and clears the web session cookie", async () => {
    const { logout } = await import("./logout");

    await logout();

    expect(apiFetchMock).toHaveBeenCalledWith("/v1/auth/logout", {
      method: "POST",
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/session", {
      method: "DELETE",
    });
  });

  it("does not throw when one of the requests fails", async () => {
    apiFetchMock.mockRejectedValue(new Error("network error"));
    const { logout } = await import("./logout");

    await expect(logout()).resolves.toBeUndefined();
  });

  it("resolves even when clearing the web session cookie is rejected", async () => {
    fetchMock.mockRejectedValue(new Error("network error"));
    const { logout } = await import("./logout");

    await expect(logout()).resolves.toBeUndefined();
    expect(apiFetchMock).toHaveBeenCalledWith("/v1/auth/logout", {
      method: "POST",
    });
  });
});
