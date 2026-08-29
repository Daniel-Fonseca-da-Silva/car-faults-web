import { fetchFavoriteVehiclesPage } from "./fetch-favorite-vehicles-page";

const fetchCursorPageMock = jest.fn();

jest.mock("@/lib/lists/fetch-cursor-page", () => ({
  fetchCursorPage: (...args: unknown[]) => fetchCursorPageMock(...args),
}));

describe("fetchFavoriteVehiclesPage", () => {
  afterEach(() => {
    fetchCursorPageMock.mockReset();
  });

  it("requests the favorites list with cursor params", async () => {
    const page = { items: [], nextCursor: null };
    fetchCursorPageMock.mockResolvedValue(page);

    await expect(
      fetchFavoriteVehiclesPage({ limit: 12, cursor: "c2" })
    ).resolves.toEqual(page);
    expect(fetchCursorPageMock).toHaveBeenCalledWith(
      "/v1/activity-logs/favorites?limit=12&cursor=c2"
    );
  });
});
