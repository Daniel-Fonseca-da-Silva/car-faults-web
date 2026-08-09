/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

const serverApiFetchMock = jest.fn();

jest.mock("@/lib/api/server-client", () => ({
  serverApiFetch: (...args: unknown[]) =>
    (serverApiFetchMock as (...a: unknown[]) => unknown)(...args),
}));

import { POST } from "./route";

function buildRequest(body: unknown): NextRequest {
  return new NextRequest("https://web.example.com/api/lookup/prepare", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const validBody = {
  brand: "Volkswagen",
  model: "Golf",
  year: 2018,
  engine: "2.0 TDI",
  fuelType: "diesel",
  turnstileToken: "token-abc",
};

describe("POST /api/lookup/prepare", () => {
  beforeEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("warms the cache and returns the defects href on success", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const response = await POST(buildRequest(validBody));

    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/lookups?brand=Volkswagen&model=Golf&year=2018&engine=2.0+TDI&fuelType=diesel",
      { headers: { "x-turnstile-token": "token-abc" } }
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      href: "/defects/volkswagen/golf/2018/diesel/2-0-tdi",
    });
  });

  it("includes doors and language in the API query when present", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await POST(buildRequest({ ...validBody, doors: 5, language: "pt-PT" }));

    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/lookups?brand=Volkswagen&model=Golf&year=2018&engine=2.0+TDI&fuelType=diesel&doors=5&language=pt-PT",
      { headers: { "x-turnstile-token": "token-abc" } }
    );
  });

  it("includes doors in the returned href when present", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const response = await POST(buildRequest({ ...validBody, doors: 5 }));

    expect(await response.json()).toEqual({
      href: "/defects/volkswagen/golf/2018/diesel/2-0-tdi?doors=5",
    });
  });

  it("returns 403 when the API rejects the Turnstile token", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 403 }));

    const response = await POST(buildRequest(validBody));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "TURNSTILE_REQUIRED" });
  });

  it("returns 502 when the API fails for another reason", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    const response = await POST(buildRequest(validBody));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "LOOKUP_FAILED" });
  });

  it("returns 400 without calling the API when required criteria are missing", async () => {
    const response = await POST(
      buildRequest({ turnstileToken: "token-abc" })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "INVALID_CRITERIA" });
    expect(serverApiFetchMock).not.toHaveBeenCalled();
  });

  it("returns 400 without calling the API when the Turnstile token is missing", async () => {
    const response = await POST(
      buildRequest({ ...validBody, turnstileToken: undefined })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "TURNSTILE_REQUIRED" });
    expect(serverApiFetchMock).not.toHaveBeenCalled();
  });
});
