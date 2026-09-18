import { fetchAdminReportsPage } from "./fetch-admin-reports-page";

const fetchCursorPageMock = jest.fn();

jest.mock("@/lib/lists/fetch-cursor-page", () => ({
  fetchCursorPage: (...args: unknown[]) => fetchCursorPageMock(...args),
}));

describe("fetchAdminReportsPage", () => {
  afterEach(() => {
    fetchCursorPageMock.mockReset();
  });

  it("requests admin reports with cursor and status filter", async () => {
    const page = { items: [], nextCursor: null };
    fetchCursorPageMock.mockResolvedValue(page);

    await expect(
      fetchAdminReportsPage({ cursor: "c2", limit: 20, status: "pending" })
    ).resolves.toEqual(page);
    expect(fetchCursorPageMock).toHaveBeenCalledWith(
      "/v1/admin/reports?limit=20&cursor=c2&status=pending"
    );
  });
});
