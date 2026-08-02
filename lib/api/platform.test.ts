/**
 * @jest-environment node
 */
import { getPlatformStats, getTopFaults } from "./platform";

const serverApiFetchMock = jest.fn();

jest.mock("./server-client", () => ({
  serverApiFetch: (...args: unknown[]) => serverApiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("getPlatformStats", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("returns the platform stats on success", async () => {
    const stats = { reportsCount: 128340, vehiclesCount: 8400, faultsCount: 34000 };
    serverApiFetchMock.mockResolvedValue(jsonResponse(stats));

    await expect(getPlatformStats()).resolves.toEqual(stats);
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/platform/stats");
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(getPlatformStats()).rejects.toThrow(
      "Failed to load platform stats: 500"
    );
  });
});

describe("getTopFaults", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("builds the query string and maps items to TopFaultEntry", async () => {
    serverApiFetchMock.mockResolvedValue(
      jsonResponse({
        items: [
          {
            id: "ki-1",
            faultTitle: "Timing chain tensioner wear",
            severity: "high",
            reportCount: 412,
            vehicle: {
              brand: "Volkswagen",
              model: "Golf",
              yearFrom: 2015,
              engine: "1.6 TDI",
              fuelType: "diesel",
              doors: 5,
            },
          },
        ],
      })
    );

    const result = await getTopFaults("en-GB", 6);

    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/platform/top-faults?locale=en-GB&limit=6"
    );
    expect(result).toEqual([
      {
        id: "ki-1",
        vehicle: {
          makeSlug: "volkswagen",
          make: "Volkswagen",
          modelSlug: "golf",
          model: "Golf",
          year: 2015,
          engine: "1.6 TDI",
          fuelType: "diesel",
          doors: 5,
        },
        faultTitle: "Timing chain tensioner wear",
        severity: "high",
        reportCount: 412,
      },
    ]);
  });

  it("omits fuelType and doors when the API does not return them", async () => {
    serverApiFetchMock.mockResolvedValue(
      jsonResponse({
        items: [
          {
            id: "ki-1",
            faultTitle: "Timing chain tensioner wear",
            severity: "high",
            reportCount: 412,
            vehicle: {
              brand: "Volkswagen",
              model: "Golf",
              yearFrom: 2015,
              engine: "1.6 TDI",
            },
          },
        ],
      })
    );

    const result = await getTopFaults("en-GB");

    expect(result[0].vehicle.fuelType).toBeUndefined();
    expect(result[0].vehicle.doors).toBeUndefined();
  });

  it("omits the limit query param when not given", async () => {
    serverApiFetchMock.mockResolvedValue(jsonResponse({ items: [] }));

    await getTopFaults("pt-PT");

    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/platform/top-faults?locale=pt-PT"
    );
  });

  it("returns an empty array when there are no items", async () => {
    serverApiFetchMock.mockResolvedValue(jsonResponse({ items: [] }));

    await expect(getTopFaults("en-GB")).resolves.toEqual([]);
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(getTopFaults("en-GB")).rejects.toThrow(
      "Failed to load top faults: 500"
    );
  });
});
