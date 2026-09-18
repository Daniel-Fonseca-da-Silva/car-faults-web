/**
 * @jest-environment node
 */
import { getAdminReports } from "./admin-reports.server";

const serverApiFetchMock = jest.fn();

jest.mock("./server-client", () => ({
  serverApiFetch: (...args: unknown[]) => serverApiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("getAdminReports", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("requests the admin reports endpoint with the given filters", async () => {
    const page = { items: [], nextCursor: null };
    serverApiFetchMock.mockResolvedValue(jsonResponse(page));

    await expect(
      getAdminReports({ status: "pending", limit: 20 })
    ).resolves.toEqual(page);
    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/admin/reports?limit=20&status=pending"
    );
  });

  it("requests without filters when none are given", async () => {
    serverApiFetchMock.mockResolvedValue(jsonResponse({ items: [], nextCursor: null }));

    await getAdminReports();

    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/admin/reports");
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(getAdminReports()).rejects.toThrow(
      "Failed to load reports: 500"
    );
  });
});
