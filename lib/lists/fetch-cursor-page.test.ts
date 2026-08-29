/**
 * @jest-environment node
 */
import { fetchCursorPage } from "./fetch-cursor-page";

const apiFetchMock = jest.fn();

jest.mock("@/lib/api/client", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("fetchCursorPage", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("returns the cursor page from a successful response", async () => {
    const page = { items: [{ id: "1" }], nextCursor: "c2" };
    apiFetchMock.mockResolvedValue(jsonResponse(page));

    await expect(fetchCursorPage("/v1/items?cursor=c1")).resolves.toEqual(page);
    expect(apiFetchMock).toHaveBeenCalledWith("/v1/items?cursor=c1");
  });

  it("throws on an error response", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(fetchCursorPage("/v1/items")).rejects.toThrow(
      "Failed to load page: 500"
    );
  });
});
