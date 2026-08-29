import { fetchGarageVehiclesPage } from "./fetch-garage-vehicles-page";

const fetchCursorPageMock = jest.fn();

jest.mock("@/lib/lists/fetch-cursor-page", () => ({
  fetchCursorPage: (...args: unknown[]) => fetchCursorPageMock(...args),
}));

describe("fetchGarageVehiclesPage", () => {
  afterEach(() => {
    fetchCursorPageMock.mockReset();
  });

  it("requests the garage list with language and cursor params", async () => {
    const page = { items: [], nextCursor: null };
    fetchCursorPageMock.mockResolvedValue(page);

    await expect(
      fetchGarageVehiclesPage({
        language: "pt-PT",
        limit: 20,
        cursor: "c2",
      })
    ).resolves.toEqual(page);
    expect(fetchCursorPageMock).toHaveBeenCalledWith(
      "/v1/user-vehicles?language=pt-PT&limit=20&cursor=c2"
    );
  });
});
