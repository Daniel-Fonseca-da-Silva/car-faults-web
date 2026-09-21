/**
 * @jest-environment node
 */
describe("apiFetch", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(new Response(null));
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("routes through the same-origin BFF proxy with credentials included", async () => {
    const { apiFetch } = await import("./client");

    await apiFetch("/v1/admin/vehicle-models?cursor=abc&limit=20", {
      method: "GET",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/bff?path=%2Fv1%2Fadmin%2Fvehicle-models%3Fcursor%3Dabc%26limit%3D20",
      expect.objectContaining({ method: "GET", credentials: "include" })
    );
  });
});
