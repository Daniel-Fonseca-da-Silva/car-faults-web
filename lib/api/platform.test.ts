/**
 * @jest-environment node
 */
import {
  DATABASE_STATUS_REVALIDATE_SECONDS,
  getDatabaseStatus,
  getPlatformFaults,
  getPlatformStats,
  getPlatformVehicles,
} from "./platform";

const publicApiFetchMock = jest.fn();

jest.mock("./public-client", () => ({
  publicApiFetch: (...args: unknown[]) => publicApiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("getPlatformStats", () => {
  afterEach(() => {
    publicApiFetchMock.mockReset();
  });

  it("returns the platform stats on success", async () => {
    const stats = { reportsCount: 128340, vehiclesCount: 8400, faultsCount: 34000 };
    publicApiFetchMock.mockResolvedValue(jsonResponse(stats));

    await expect(getPlatformStats()).resolves.toEqual(stats);
    expect(publicApiFetchMock).toHaveBeenCalledWith("/v1/platform/stats");
  });

  it("returns zeroed stats on an error response", async () => {
    publicApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(getPlatformStats()).resolves.toEqual({
      reportsCount: 0,
      vehiclesCount: 0,
      faultsCount: 0,
    });
  });

  it("returns zeroed stats when the request throws", async () => {
    publicApiFetchMock.mockRejectedValue(new Error("network error"));

    await expect(getPlatformStats()).resolves.toEqual({
      reportsCount: 0,
      vehiclesCount: 0,
      faultsCount: 0,
    });
  });
});

describe("getPlatformFaults", () => {
  afterEach(() => {
    publicApiFetchMock.mockReset();
  });

  it("builds the query string and maps items to TopFaultEntry", async () => {
    publicApiFetchMock.mockResolvedValue(
      jsonResponse({
        items: [
          {
            id: "ki-1",
            faultTitle: "Timing chain tensioner wear",
            severity: "high",
            reportCount: 412,
            contentLocale: "en-GB",
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

    expect(publicApiFetchMock).toHaveBeenCalledWith(
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
          contentLocale: "en-GB",
        },
      ],
      nextCursor: null,
    });
  });

  it("omits fuelType and doors when the API does not return them", async () => {
    publicApiFetchMock.mockResolvedValue(
      jsonResponse({
        items: [
          {
            id: "ki-1",
            faultTitle: "Timing chain tensioner wear",
            severity: "high",
            reportCount: 412,
            contentLocale: "en-GB",
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
    publicApiFetchMock.mockResolvedValue(
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

    expect(publicApiFetchMock).toHaveBeenCalledWith(
      "/v1/platform/faults?locale=pt-PT&limit=9&cursor=c2&brand=Volkswagen&model=Golf&year=2018&fuelType=diesel&doors=5&engine=1.6+TDI"
    );
  });

  it("omits optional query params when not given", async () => {
    publicApiFetchMock.mockResolvedValue(
      jsonResponse({ items: [], nextCursor: null })
    );

    await getPlatformFaults({ locale: "pt-PT" });

    expect(publicApiFetchMock).toHaveBeenCalledWith(
      "/v1/platform/faults?locale=pt-PT"
    );
  });

  it("returns an empty items array when there are no items", async () => {
    publicApiFetchMock.mockResolvedValue(
      jsonResponse({ items: [], nextCursor: null })
    );

    await expect(getPlatformFaults({ locale: "en-GB" })).resolves.toEqual({
      items: [],
      nextCursor: null,
    });
  });

  it("returns an empty page on an error response", async () => {
    publicApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(
      getPlatformFaults({ locale: "en-GB", cursor: "c2", limit: 9 })
    ).resolves.toEqual({ items: [], nextCursor: null });
  });

  it("returns an empty page with defaults when the request throws", async () => {
    publicApiFetchMock.mockRejectedValue(new Error("network error"));

    await expect(getPlatformFaults({ locale: "en-GB" })).resolves.toEqual({
      items: [],
      nextCursor: null,
    });
  });
});

describe("getPlatformVehicles", () => {
  afterEach(() => {
    publicApiFetchMock.mockReset();
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
    publicApiFetchMock.mockResolvedValue(jsonResponse(page));

    await expect(
      getPlatformVehicles({ limit: 50 })
    ).resolves.toEqual(page);

    expect(publicApiFetchMock).toHaveBeenCalledWith(
      "/v1/platform/vehicles?limit=50"
    );
  });

  it("omits query params when not given", async () => {
    publicApiFetchMock.mockResolvedValue(
      jsonResponse({ items: [], nextCursor: null })
    );

    await getPlatformVehicles();

    expect(publicApiFetchMock).toHaveBeenCalledWith("/v1/platform/vehicles");
  });

  it("rejects on an error response", async () => {
    publicApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(
      getPlatformVehicles({ cursor: "c3", limit: 50 })
    ).rejects.toThrow("500");
  });

  it("rejects when the request throws", async () => {
    publicApiFetchMock.mockRejectedValue(new Error("network error"));

    await expect(getPlatformVehicles()).rejects.toThrow("network error");
  });
});

describe("getDatabaseStatus", () => {
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  });

  it("returns true when the health check passes, caching it briefly", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: "ok" }));

    await expect(getDatabaseStatus()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/v1/health", {
      next: { revalidate: DATABASE_STATUS_REVALIDATE_SECONDS },
    });
  });

  it("returns false when the health check fails", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: "error" }, 503));

    await expect(getDatabaseStatus()).resolves.toBe(false);
  });

  it("returns false when the request throws", async () => {
    fetchMock.mockRejectedValue(new Error("network error"));

    await expect(getDatabaseStatus()).resolves.toBe(false);
  });
});
