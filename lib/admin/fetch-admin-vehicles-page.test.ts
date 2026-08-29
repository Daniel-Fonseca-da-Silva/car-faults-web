import { fetchAdminVehiclesPage } from "./fetch-admin-vehicles-page";

const fetchCursorPageMock = jest.fn();

jest.mock("@/lib/lists/fetch-cursor-page", () => ({
  fetchCursorPage: (...args: unknown[]) => fetchCursorPageMock(...args),
}));

describe("fetchAdminVehiclesPage", () => {
  afterEach(() => {
    fetchCursorPageMock.mockReset();
  });

  it("requests admin vehicle models with cursor and filters", async () => {
    const page = { items: [], nextCursor: null };
    fetchCursorPageMock.mockResolvedValue(page);

    await expect(
      fetchAdminVehiclesPage({
        cursor: "c2",
        limit: 20,
        brand: "VW",
        model: "Polo",
      })
    ).resolves.toEqual(page);
    expect(fetchCursorPageMock).toHaveBeenCalledWith(
      "/v1/admin/vehicle-models?limit=20&cursor=c2&brand=VW&model=Polo"
    );
  });
});
