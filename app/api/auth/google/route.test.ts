/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

import { GET } from "./route";

describe("GET /api/auth/google", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
  });

  function startLogin(query = "?locale=en-GB") {
    return GET(new NextRequest(`https://web.example.com/api/auth/google${query}`));
  }

  it("redirects to the API with a locale-prefixed random state bound to an httpOnly cookie", () => {
    const response = startLogin();

    const cookie = response.cookies.get("oauth_state");
    expect(cookie?.value).toMatch(/^en-GB\.[A-Za-z0-9_-]{43}$/);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("lax");
    expect(cookie?.path).toBe("/api/auth");
    expect(cookie?.maxAge).toBe(600);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      `https://api.example.com/v1/auth/google?state=${cookie?.value}`
    );
  });

  it("generates a different state on every login attempt", () => {
    const first = startLogin().cookies.get("oauth_state")?.value;
    const second = startLogin().cookies.get("oauth_state")?.value;

    expect(first).not.toBe(second);
  });

  it("falls back to the default locale for unknown locales", () => {
    const response = startLogin("?locale=fr-FR");

    expect(response.cookies.get("oauth_state")?.value).toMatch(/^pt-PT\./);
  });
});
