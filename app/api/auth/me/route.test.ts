/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

const getCurrentUserMock = jest.fn();

jest.mock("@/lib/api/users", () => ({
  getCurrentUser: (...args: unknown[]) =>
    (getCurrentUserMock as (...a: unknown[]) => unknown)(...args),
}));

import { GET } from "./route";

const user = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana Silva",
  role: "user",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function buildRequest(cookie?: string): NextRequest {
  return new NextRequest("https://web.example.com/api/auth/me", {
    headers: cookie ? { cookie } : {},
  });
}

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    getCurrentUserMock.mockReset();
  });

  it("answers null without calling the API when there is no session cookie", async () => {
    const response = await GET(buildRequest());

    expect(getCurrentUserMock).not.toHaveBeenCalled();
    expect(await response.json()).toEqual({ user: null });
  });

  it("returns the signed-in user when a session cookie is present", async () => {
    getCurrentUserMock.mockResolvedValue(user);

    const response = await GET(buildRequest("access_token=token-123"));

    expect(getCurrentUserMock).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual({ user });
  });

  it("returns null when the session is no longer valid", async () => {
    getCurrentUserMock.mockResolvedValue(null);

    const response = await GET(buildRequest("access_token=expired"));

    expect(await response.json()).toEqual({ user: null });
  });

  it("is never cached", async () => {
    const response = await GET(buildRequest());

    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });
});
