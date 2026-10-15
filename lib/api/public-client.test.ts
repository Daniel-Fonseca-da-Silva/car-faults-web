/**
 * @jest-environment node
 */
import {
  INTERNAL_API_KEY_HEADER,
  PUBLIC_CATALOG_REVALIDATE_SECONDS,
  PUBLIC_CATALOG_TAG,
  publicApiFetch,
} from "./public-client";

describe("publicApiFetch", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;
  const originalInternalApiKey = process.env.INTERNAL_API_KEY;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    fetchMock = jest.fn().mockResolvedValue(new Response(null));
    global.fetch = fetchMock;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
    process.env.INTERNAL_API_KEY = originalInternalApiKey;
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

  it("sends the internal API key when configured", async () => {
    process.env.INTERNAL_API_KEY = "internal-key";

    await publicApiFetch("/v1/platform/stats");

    const [, init] = fetchMock.mock.calls[0];
    expect(new Headers(init.headers).get(INTERNAL_API_KEY_HEADER)).toBe(
      "internal-key"
    );
  });

  it("omits the internal API key header when unset", async () => {
    delete process.env.INTERNAL_API_KEY;

    await publicApiFetch("/v1/platform/stats");

    const [, init] = fetchMock.mock.calls[0];
    expect(new Headers(init.headers).get(INTERNAL_API_KEY_HEADER)).toBeNull();
  });
});
