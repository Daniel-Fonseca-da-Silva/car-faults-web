/**
 * @jest-environment node
 */
import { getVehicleLookup, getVehicleLookupByPath } from "./lookups";

const serverApiFetchMock = jest.fn();

jest.mock("./server-client", () => ({
  serverApiFetch: (...args: unknown[]) => serverApiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("getVehicleLookup", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("builds the query string and returns the lookup on success", async () => {
    const lookup = {
      vehicle: { id: "veh-1", brand: "Volkswagen", model: "Polo" },
      knownIssues: [],
    };
    serverApiFetchMock.mockResolvedValue(jsonResponse(lookup));

    await expect(
      getVehicleLookup({
        brand: "Volkswagen",
        model: "Polo",
        year: 2001,
        engine: "1.0",
        fuelType: "gasoline",
        doors: 3,
        language: "en-GB",
      })
    ).resolves.toEqual(lookup);

    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/lookups?brand=Volkswagen&model=Polo&year=2001&engine=1.0&fuelType=gasoline&doors=3&language=en-GB"
    );
  });

  it("omits optional doors and language when not given", async () => {
    serverApiFetchMock.mockResolvedValue(
      jsonResponse({ vehicle: {}, knownIssues: [] })
    );

    await getVehicleLookup({
      brand: "Fiat",
      model: "Uno",
      year: 2007,
      engine: "1.0",
      fuelType: "gasoline",
    });

    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/lookups?brand=Fiat&model=Uno&year=2007&engine=1.0&fuelType=gasoline"
    );
  });

  it("returns null on a 404 response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(
      getVehicleLookup({
        brand: "Fiat",
        model: "Uno",
        year: 2007,
        engine: "1.0",
        fuelType: "gasoline",
      })
    ).resolves.toBeNull();
  });

  it("throws on other error responses", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(
      getVehicleLookup({
        brand: "Fiat",
        model: "Uno",
        year: 2007,
        engine: "1.0",
        fuelType: "gasoline",
      })
    ).rejects.toThrow("Failed to load vehicle lookup: 500");
  });
});

describe("getVehicleLookupByPath", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("builds the query string from path slugs and returns the lookup on success", async () => {
    const lookup = {
      vehicle: { id: "veh-1", brand: "Volkswagen", model: "Polo" },
      knownIssues: [],
    };
    serverApiFetchMock.mockResolvedValue(jsonResponse(lookup));

    await expect(
      getVehicleLookupByPath({
        make: "volkswagen",
        model: "polo",
        year: 2001,
        fuelType: "gasoline",
        engine: "1-0",
        doors: 3,
        language: "en-GB",
      })
    ).resolves.toEqual(lookup);

    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/lookups/by-path?make=volkswagen&model=polo&year=2001&fuelType=gasoline&engine=1-0&doors=3&language=en-GB"
    );
  });

  it("omits optional doors and language when not given", async () => {
    serverApiFetchMock.mockResolvedValue(
      jsonResponse({ vehicle: {}, knownIssues: [] })
    );

    await getVehicleLookupByPath({
      make: "fiat",
      model: "uno",
      year: 2007,
      fuelType: "gasoline",
      engine: "1-0",
    });

    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/lookups/by-path?make=fiat&model=uno&year=2007&fuelType=gasoline&engine=1-0"
    );
  });

  it("returns null on a 404 response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(
      getVehicleLookupByPath({
        make: "fiat",
        model: "uno",
        year: 2007,
        fuelType: "gasoline",
        engine: "1-0",
      })
    ).resolves.toBeNull();
  });

  it("throws on other error responses", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(
      getVehicleLookupByPath({
        make: "fiat",
        model: "uno",
        year: 2007,
        fuelType: "gasoline",
        engine: "1-0",
      })
    ).rejects.toThrow("Failed to load vehicle lookup: 500");
  });
});
