/**
 * @jest-environment node
 */
import {
  getDatabaseStatus,
  getPlatformFaults,
  getPlatformStats,
  getPlatformVehicles,
} from "./platform";

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

  it("returns zeroed stats on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(getPlatformStats()).resolves.toEqual({
      reportsCount: 0,
      vehiclesCount: 0,
      faultsCount: 0,
    });
  });

  it("returns zeroed stats when the request throws", async () => {
    serverApiFetchMock.mockRejectedValue(new Error("network error"));

    await expect(getPlatformStats()).resolves.toEqual({
      reportsCount: 0,
      vehiclesCount: 0,
      faultsCount: 0,
    });
  });
});

describe("getPlatformFaults", () => {
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
        nextCursor: null,
      })
    );

    const result = await getPlatformFaults({ locale: "en-GB", limit: 9 });

    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/platform/faults?locale=en-GB&limit=9"
    );
    expect(result).toEqual({
      items: [
        {
          id: "ki-1",
          vehicle: {
            make: "Volkswagen",
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
      ],
      nextCursor: null,
    });
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
        nextCursor: null,
      })
    );

    const result = await getPlatformFaults({ locale: "en-GB" });

    expect(result.items[0].vehicle.fuelType).toBeUndefined();
    expect(result.items[0].vehicle.doors).toBeUndefined();
  });

  it("includes the filter query params when given", async () => {
    serverApiFetchMock.mockResolvedValue(
      jsonResponse({ items: [], nextCursor: null })
    );

    await getPlatformFaults({
      locale: "pt-PT",
      cursor: "c2",
      limit: 9,
      brand: "Volkswagen",
      model: "Golf",
      year: 2018,
      fuelType: "diesel",
      doors: 5,
      engine: "1.6 TDI",
    });

    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/platform/faults?locale=pt-PT&limit=9&cursor=c2&brand=Volkswagen&model=Golf&year=2018&fuelType=diesel&doors=5&engine=1.6+TDI"
    );
  });

  it("omits optional query params when not given", async () => {
    serverApiFetchMock.mockResolvedValue(
      jsonResponse({ items: [], nextCursor: null })
    );

    await getPlatformFaults({ locale: "pt-PT" });

    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/platform/faults?locale=pt-PT"
    );
  });

  it("returns an empty items array when there are no items", async () => {
    serverApiFetchMock.mockResolvedValue(
      jsonResponse({ items: [], nextCursor: null })
    );

    await expect(getPlatformFaults({ locale: "en-GB" })).resolves.toEqual({
      items: [],
      nextCursor: null,
    });
  });

  it("returns an empty page on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(
      getPlatformFaults({ locale: "en-GB", cursor: "c2", limit: 9 })
    ).resolves.toEqual({ items: [], nextCursor: null });
  });

  it("returns an empty page with defaults when the request throws", async () => {
    serverApiFetchMock.mockRejectedValue(new Error("network error"));

    await expect(getPlatformFaults({ locale: "en-GB" })).resolves.toEqual({
      items: [],
      nextCursor: null,
    });
  });
});

describe("getPlatformVehicles", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("builds the query string and returns the paginated catalog on success", async () => {
    const page = {
      items: [
        {
          brand: "Volkswagen",
          model: "Golf",
          yearFrom: 2018,
          engine: "2.0 TDI",
          fuelType: "diesel",
          doors: 5,
        },
      ],
      nextCursor: null,
    };
    serverApiFetchMock.mockResolvedValue(jsonResponse(page));

    await expect(
      getPlatformVehicles({ limit: 50 })
    ).resolves.toEqual(page);

    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/platform/vehicles?limit=50"
    );
  });

  it("omits query params when not given", async () => {
    serverApiFetchMock.mockResolvedValue(
      jsonResponse({ items: [], nextCursor: null })
    );

    await getPlatformVehicles();

    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/platform/vehicles");
  });

  it("returns an empty page on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(
      getPlatformVehicles({ cursor: "c3", limit: 50 })
    ).resolves.toEqual({ items: [], nextCursor: null });
  });

  it("returns an empty page with defaults when the request throws", async () => {
    serverApiFetchMock.mockRejectedValue(new Error("network error"));

    await expect(getPlatformVehicles()).resolves.toEqual({
      items: [],
      nextCursor: null,
    });
  });
});

describe("getDatabaseStatus", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("returns true when the stats endpoint responds successfully", async () => {
    serverApiFetchMock.mockResolvedValue(jsonResponse({}));

    await expect(getDatabaseStatus()).resolves.toBe(true);
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/platform/stats");
  });

  it("returns false on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(getDatabaseStatus()).resolves.toBe(false);
  });

  it("returns false when the request throws", async () => {
    serverApiFetchMock.mockRejectedValue(new Error("network error"));

    await expect(getDatabaseStatus()).resolves.toBe(false);
  });
});
