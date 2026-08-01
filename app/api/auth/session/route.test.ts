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

function mockExchange(accessToken: string, ok = true): jest.Mock {
  const fetchMock = jest.fn().mockResolvedValue(
    new Response(JSON.stringify({ accessToken }), {
      status: ok ? 200 : 401,
    })
  );
  global.fetch = fetchMock;
  return fetchMock;
}

describe("GET /api/auth/session", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
    jest.resetAllMocks();
  });

  it("exchanges the code, sets the session cookie and redirects to the locale home", async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = buildToken(exp);
    const fetchMock = mockExchange(token);
    const request = new NextRequest(
      "https://web.example.com/api/auth/session?code=xyz123&locale=en-GB"
    );

    const response = await GET(request);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/v1/auth/session/exchange",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ code: "xyz123" }),
      })
    );
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

  it("redirects to login without setting a cookie when there is no code", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock;
    const request = new NextRequest(
      "https://web.example.com/api/auth/session?locale=pt-PT"
    );

    const response = await GET(request);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://web.example.com/pt-PT/login"
    );
    expect(response.cookies.get("access_token")).toBeUndefined();
  });

  it("redirects to login without setting a cookie when the exchange fails", async () => {
    mockExchange("", false);
    const request = new NextRequest(
      "https://web.example.com/api/auth/session?code=bad-code&locale=pt-PT"
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://web.example.com/pt-PT/login"
    );
    expect(response.cookies.get("access_token")).toBeUndefined();
  });

  it("falls back to the default locale when none is provided", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock;
    const request = new NextRequest(
      "https://web.example.com/api/auth/session"
    );

    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      "https://web.example.com/pt-PT/login"
    );
  });

  it("falls back to a 7-day maxAge when the token has no exp claim", async () => {
    const token = buildTokenWithoutExp();
    mockExchange(token);
    const request = new NextRequest(
      "https://web.example.com/api/auth/session?code=xyz123&locale=en-GB"
    );

    const response = await GET(request);

    const cookie = response.cookies.get("access_token");
    expect(cookie?.maxAge).toBe(60 * 60 * 24 * 7);
  });

  it("sets the cookie as secure in production", async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      configurable: true,
    });

    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = buildToken(exp);
    mockExchange(token);
    const request = new NextRequest(
      "https://web.example.com/api/auth/session?code=xyz123&locale=en-GB"
    );

    const response = await GET(request);

    expect(response.cookies.get("access_token")?.secure).toBe(true);

    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalNodeEnv,
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
