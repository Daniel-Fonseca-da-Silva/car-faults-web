import { getAdsenseClientId, getApiBaseUrl, getTurnstileSiteKey } from "./config";

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

describe("getAdsenseClientId", () => {
  const originalEnv = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  afterEach(() => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = originalEnv;
  });

  it("returns the configured AdSense client id", () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = "ca-pub-1234567890123456";

    expect(getAdsenseClientId()).toBe("ca-pub-1234567890123456");
  });

  it("returns undefined when NEXT_PUBLIC_ADSENSE_CLIENT_ID is not set", () => {
    delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

    expect(getAdsenseClientId()).toBeUndefined();
  });

  it("returns undefined when NEXT_PUBLIC_ADSENSE_CLIENT_ID is empty", () => {
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = "";

    expect(getAdsenseClientId()).toBeUndefined();
  });
});
