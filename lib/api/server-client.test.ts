/**
 * @jest-environment node
 */
const getCookieMock = jest.fn();

jest.mock("next/headers", () => ({
  cookies: async () => ({
    get: getCookieMock,
  }),
}));

describe("serverApiFetch", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    fetchMock = jest.fn().mockResolvedValue(new Response(null));
    global.fetch = fetchMock;
    getCookieMock.mockReset();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
    jest.resetAllMocks();
  });

  it("attaches the session cookie as a Bearer token", async () => {
    getCookieMock.mockReturnValue({ value: "jwt-token" });
    const { serverApiFetch } = await import("./server-client");

    await serverApiFetch("/v1/users/me");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.example.com/v1/users/me");
    expect((init.headers as Headers).get("Authorization")).toBe(
      "Bearer jwt-token"
    );
    expect(init.cache).toBe("no-store");
  });

  it("omits the Authorization header when there is no session cookie", async () => {
    getCookieMock.mockReturnValue(undefined);
    const { serverApiFetch } = await import("./server-client");

    await serverApiFetch("/v1/users/me");

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Headers).get("Authorization")).toBeNull();
  });
});
