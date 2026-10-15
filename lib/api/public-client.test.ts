/**
 * @jest-environment node
 */
import {
  PUBLIC_CATALOG_REVALIDATE_SECONDS,
  PUBLIC_CATALOG_TAG,
  publicApiFetch,
} from "./public-client";

describe("publicApiFetch", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    fetchMock = jest.fn().mockResolvedValue(new Response(null));
    global.fetch = fetchMock;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
    jest.resetAllMocks();
  });

  it("caches the response under the public catalog tag", async () => {
    await publicApiFetch("/v1/platform/vehicles");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.example.com/v1/platform/vehicles");
    expect(init.next).toEqual({
      revalidate: PUBLIC_CATALOG_REVALIDATE_SECONDS,
      tags: [PUBLIC_CATALOG_TAG],
    });
    expect(init.cache).toBeUndefined();
  });

  it("sends no Authorization header", async () => {
    await publicApiFetch("/v1/platform/stats");

    const [, init] = fetchMock.mock.calls[0];
    expect(new Headers(init.headers).get("Authorization")).toBeNull();
  });
});
