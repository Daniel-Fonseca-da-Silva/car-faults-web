import {
  fetchAllPlatformVehicles,
  getCatalogBrand,
  getCatalogBrands,
  getCatalogModel,
  getCatalogModels,
  getCatalogVariants,
} from "./platform-catalog";

const getPlatformVehiclesMock = jest.fn();

jest.mock("@/lib/api/platform", () => ({
  getPlatformVehicles: (...args: unknown[]) =>
    getPlatformVehiclesMock(...args),
}));

const golf: {
  brand: string;
  model: string;
  yearFrom: number;
  engine: string;
  fuelType: string;
  doors?: number;
} = {
  brand: "Volkswagen",
  model: "Golf",
  yearFrom: 2018,
  engine: "2.0 TDI",
  fuelType: "diesel",
  doors: 5,
};

const classeC = {
  brand: "Mercedes-Benz",
  model: "Classe C",
  yearFrom: 2017,
  engine: "C220 d 2.1",
  fuelType: "diesel",
};

const vehicles = [golf, classeC];

afterEach(() => {
  getPlatformVehiclesMock.mockReset();
});

describe("fetchAllPlatformVehicles", () => {
  it("pages through the catalog until every item is fetched", async () => {
    getPlatformVehiclesMock
      .mockResolvedValueOnce({ items: [golf], nextCursor: "c2" })
      .mockResolvedValueOnce({
        items: [classeC],
        nextCursor: null,
      });

    const items = await fetchAllPlatformVehicles();

    expect(items).toEqual(vehicles);
    expect(getPlatformVehiclesMock).toHaveBeenCalledTimes(2);
    expect(getPlatformVehiclesMock).toHaveBeenNthCalledWith(1, {
      cursor: null,
      limit: 200,
    });
    expect(getPlatformVehiclesMock).toHaveBeenNthCalledWith(2, {
      cursor: "c2",
      limit: 200,
    });
  });

  it("stops when the platform returns a null nextCursor", async () => {
    getPlatformVehiclesMock.mockResolvedValueOnce({
      items: [],
      nextCursor: null,
    });

    const items = await fetchAllPlatformVehicles();

    expect(items).toEqual([]);
    expect(getPlatformVehiclesMock).toHaveBeenCalledTimes(1);
  });
});

describe("getCatalogBrands", () => {
  it("returns the unique slugified brands from the catalog", async () => {
    getPlatformVehiclesMock.mockResolvedValue({
      items: vehicles,
      nextCursor: null,
    });

    expect(await getCatalogBrands()).toEqual([
      { slug: "volkswagen", name: "Volkswagen" },
      { slug: "mercedes-benz", name: "Mercedes-Benz" },
    ]);
  });

  it("returns an empty list when the catalog has no vehicles", async () => {
    getPlatformVehiclesMock.mockResolvedValue({
      items: [],
      nextCursor: null,
    });

    expect(await getCatalogBrands()).toEqual([]);
  });
});

describe("getCatalogBrand", () => {
  it("finds the brand by slug", async () => {
    getPlatformVehiclesMock.mockResolvedValue({
      items: vehicles,
      nextCursor: null,
    });

    expect(await getCatalogBrand("volkswagen")).toEqual({
      slug: "volkswagen",
      name: "Volkswagen",
    });
  });

  it("returns null when no brand matches the slug", async () => {
    getPlatformVehiclesMock.mockResolvedValue({
      items: vehicles,
      nextCursor: null,
    });

    expect(await getCatalogBrand("tesla")).toBeNull();
  });
});

describe("getCatalogModels", () => {
  it("returns the unique slugified models for the given brand", async () => {
    getPlatformVehiclesMock.mockResolvedValue({
      items: vehicles,
      nextCursor: null,
    });

    expect(await getCatalogModels("volkswagen")).toEqual([
      { slug: "golf", name: "Golf" },
    ]);
  });

  it("returns an empty list when the brand has no models", async () => {
    getPlatformVehiclesMock.mockResolvedValue({
      items: vehicles,
      nextCursor: null,
    });

    expect(await getCatalogModels("tesla")).toEqual([]);
  });
});

describe("getCatalogModel", () => {
  it("finds the model by brand and model slug", async () => {
    getPlatformVehiclesMock.mockResolvedValue({
      items: vehicles,
      nextCursor: null,
    });

    expect(await getCatalogModel("volkswagen", "golf")).toEqual({
      slug: "golf",
      name: "Golf",
    });
  });

  it("returns null when no model matches", async () => {
    getPlatformVehiclesMock.mockResolvedValue({
      items: vehicles,
      nextCursor: null,
    });

    expect(await getCatalogModel("volkswagen", "polo")).toBeNull();
  });
});

describe("getCatalogVariants", () => {
  it("returns every vehicle variant matching the brand and model slug", async () => {
    const golfEstate = { ...golf, engine: "1.5 TSI" };
    getPlatformVehiclesMock.mockResolvedValue({
      items: [golf, golfEstate, classeC],
      nextCursor: null,
    });

    expect(await getCatalogVariants("volkswagen", "golf")).toEqual([
      golf,
      golfEstate,
    ]);
  });

  it("returns an empty list when no variant matches", async () => {
    getPlatformVehiclesMock.mockResolvedValue({
      items: vehicles,
      nextCursor: null,
    });

    expect(await getCatalogVariants("tesla", "model-3")).toEqual([]);
  });
});
