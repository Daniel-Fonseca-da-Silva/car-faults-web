/**
 * @jest-environment node
 */
import { SESSION_COOKIE_NAME } from "@/lib/api/constants";

const serverApiFetchMock = jest.fn();
const deleteCookieMock = jest.fn();

jest.mock("@/lib/api/server-client", () => ({
  serverApiFetch: (...args: unknown[]) => serverApiFetchMock(...args),
}));

jest.mock("next/headers", () => ({
  cookies: async () => ({
    delete: deleteCookieMock,
  }),
}));

describe("logout", () => {
  beforeEach(() => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("revokes the API token and clears the web session cookie", async () => {
    const { logout } = await import("./logout");

    await logout();

    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/auth/logout", {
      method: "POST",
    });
    expect(deleteCookieMock).toHaveBeenCalledWith(SESSION_COOKIE_NAME);
  });

  it("still clears the web session cookie when revoking the API token fails", async () => {
    serverApiFetchMock.mockRejectedValue(new Error("network error"));
    const { logout } = await import("./logout");

    await expect(logout()).resolves.toBeUndefined();
    expect(deleteCookieMock).toHaveBeenCalledWith(SESSION_COOKIE_NAME);
  });
});
