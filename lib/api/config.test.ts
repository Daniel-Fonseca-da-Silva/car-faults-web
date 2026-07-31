import { getApiBaseUrl, getTurnstileSiteKey } from "./config";

describe("getApiBaseUrl", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
  });

  it("returns the configured API base URL", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

    expect(getApiBaseUrl()).toBe("https://api.example.com");
  });

  it("throws when NEXT_PUBLIC_API_URL is not set", () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    expect(() => getApiBaseUrl()).toThrow("NEXT_PUBLIC_API_URL is not set");
  });
});

describe("getTurnstileSiteKey", () => {
  const originalEnv = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  afterEach(() => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = originalEnv;
  });

  it("returns the configured Turnstile site key", () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";

    expect(getTurnstileSiteKey()).toBe("1x00000000000000000000AA");
  });

  it("throws when NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set", () => {
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    expect(() => getTurnstileSiteKey()).toThrow(
      "NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set"
    );
  });
});
