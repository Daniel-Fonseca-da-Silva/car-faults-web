import { getSiteUrl } from "./get-site-url";

describe("getSiteUrl", () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (originalSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    }
  });

  it("returns the NEXT_PUBLIC_SITE_URL env var when set", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://autocronica.autos";

    expect(getSiteUrl()).toBe("https://autocronica.autos");
  });

  it("falls back to localhost when the env var is not set", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});
