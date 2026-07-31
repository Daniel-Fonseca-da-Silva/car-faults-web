import { getApiBaseUrl } from "./config";

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
