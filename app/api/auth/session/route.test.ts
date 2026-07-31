/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

import { DELETE, GET } from "./route";

function buildToken(exp: number): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString(
    "base64url"
  );
  const body = Buffer.from(JSON.stringify({ sub: "user-1", exp })).toString(
    "base64url"
  );
  return `${header}.${body}.signature`;
}

function buildTokenWithoutExp(): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString(
    "base64url"
  );
  const body = Buffer.from(JSON.stringify({ sub: "user-1" })).toString(
    "base64url"
  );
  return `${header}.${body}.signature`;
}

describe("GET /api/auth/session", () => {
  it("sets the session cookie and redirects to the locale home when a token is present", () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = buildToken(exp);
    const request = new NextRequest(
      `https://web.example.com/api/auth/session?token=${token}&locale=en-GB`
    );

    const response = GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://web.example.com/en-GB"
    );

    const cookie = response.cookies.get("access_token");
    expect(cookie?.value).toBe(token);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.path).toBe("/");
    expect(cookie?.maxAge).toBeGreaterThan(3590);
  });

  it("redirects to login without setting a cookie when there is no token", () => {
    const request = new NextRequest(
      "https://web.example.com/api/auth/session?locale=pt-PT"
    );

    const response = GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://web.example.com/pt-PT/login"
    );
    expect(response.cookies.get("access_token")).toBeUndefined();
  });

  it("falls back to the default locale when none is provided", () => {
    const request = new NextRequest(
      "https://web.example.com/api/auth/session"
    );

    const response = GET(request);

    expect(response.headers.get("location")).toBe(
      "https://web.example.com/pt-PT/login"
    );
  });

  it("falls back to a 7-day maxAge when the token has no exp claim", () => {
    const token = buildTokenWithoutExp();
    const request = new NextRequest(
      `https://web.example.com/api/auth/session?token=${token}&locale=en-GB`
    );

    const response = GET(request);

    const cookie = response.cookies.get("access_token");
    expect(cookie?.maxAge).toBe(60 * 60 * 24 * 7);
  });

  it("sets the cookie as secure in production", () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      configurable: true,
    });

    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = buildToken(exp);
    const request = new NextRequest(
      `https://web.example.com/api/auth/session?token=${token}&locale=en-GB`
    );

    const response = GET(request);

    expect(response.cookies.get("access_token")?.secure).toBe(true);

    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      configurable: true,
    });
  });
});

describe("DELETE /api/auth/session", () => {
  it("clears the session cookie and returns 204", () => {
    const response = DELETE();

    expect(response.status).toBe(204);
    const cookie = response.cookies.get("access_token");
    expect(cookie?.value).toBe("");
    expect(cookie?.path).toBe("/");
    expect(cookie?.maxAge).toBe(0);
  });
});
