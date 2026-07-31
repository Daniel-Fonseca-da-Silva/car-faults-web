/**
 * @jest-environment node
 */
describe("apiFetch", () => {
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

  it("calls the API with credentials included", async () => {
    const { apiFetch } = await import("./client");

    await apiFetch("/v1/auth/logout", { method: "POST" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/v1/auth/logout",
      expect.objectContaining({ method: "POST", credentials: "include" })
    );
  });
});
