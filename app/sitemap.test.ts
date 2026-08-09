import { locales } from "@/i18n/locales";

import sitemap from "./sitemap";

const getPlatformVehiclesMock = jest.fn();

jest.mock("@/lib/api/platform", () => ({
  getPlatformVehicles: (...args: unknown[]) =>
    getPlatformVehiclesMock(...args),
}));

const vehicles = [
  {
    brand: "Volkswagen",
    model: "Golf",
    yearFrom: 2018,
    engine: "2.0 TDI",
    fuelType: "diesel",
    doors: 5,
  },
  {
    brand: "Mercedes-Benz",
    model: "Classe C",
    yearFrom: 2017,
    engine: "C220 d 2.1",
    fuelType: "diesel",
  },
];

describe("sitemap", () => {
  afterEach(() => {
    getPlatformVehiclesMock.mockReset();
  });

  it("includes every static path for every locale", async () => {
    getPlatformVehiclesMock.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 200,
    });

    const entries = await sitemap();
    const staticPaths = ["", "/defects", "/about", "/privacy"];

    for (const locale of locales) {
      for (const path of staticPaths) {
        expect(
          entries.some((entry) => entry.url === `http://localhost:3000/${locale}${path}`)
        ).toBe(true);
      }
    }
  });

  it("includes a slugified vehicle URL with fuel type and engine for every vehicle in every locale", async () => {
    getPlatformVehiclesMock.mockResolvedValue({
      items: vehicles,
      total: vehicles.length,
      page: 1,
      limit: 200,
    });

    const entries = await sitemap();

    for (const locale of locales) {
      expect(
        entries.some(
          (entry) =>
            entry.url ===
            `http://localhost:3000/${locale}/defects/volkswagen/golf/2018/diesel/2-0-tdi`
        )
      ).toBe(true);
      expect(
        entries.some(
          (entry) =>
            entry.url ===
            `http://localhost:3000/${locale}/defects/mercedes-benz/classe-c/2017/diesel/c220-d-2-1`
        )
      ).toBe(true);
    }
  });

  it("pages through the platform vehicles catalog until every item is fetched", async () => {
    getPlatformVehiclesMock
      .mockResolvedValueOnce({
        items: [vehicles[0]],
        total: 2,
        page: 1,
        limit: 1,
      })
      .mockResolvedValueOnce({
        items: [vehicles[1]],
        total: 2,
        page: 2,
        limit: 1,
      });

    await sitemap();

    expect(getPlatformVehiclesMock).toHaveBeenCalledTimes(2);
    expect(getPlatformVehiclesMock).toHaveBeenNthCalledWith(1, {
      page: 1,
      limit: 200,
    });
    expect(getPlatformVehiclesMock).toHaveBeenNthCalledWith(2, {
      page: 2,
      limit: 200,
    });
  });

  it("returns the expected total number of entries", async () => {
    getPlatformVehiclesMock.mockResolvedValue({
      items: vehicles,
      total: vehicles.length,
      page: 1,
      limit: 200,
    });

    const entries = await sitemap();
    const staticCount = locales.length * 4;
    const brandCount = locales.length * 2;
    const modelCount = locales.length * 2;
    const vehicleCount = locales.length * vehicles.length;

    expect(entries).toHaveLength(
      staticCount + brandCount + modelCount + vehicleCount
    );
  });

  it("includes a brand and model hub URL for every locale", async () => {
    getPlatformVehiclesMock.mockResolvedValue({
      items: vehicles,
      total: vehicles.length,
      page: 1,
      limit: 200,
    });

    const entries = await sitemap();

    for (const locale of locales) {
      expect(
        entries.some(
          (entry) =>
            entry.url === `http://localhost:3000/${locale}/defects/volkswagen`
        )
      ).toBe(true);
      expect(
        entries.some(
          (entry) =>
            entry.url ===
            `http://localhost:3000/${locale}/defects/volkswagen/golf`
        )
      ).toBe(true);
      expect(
        entries.some(
          (entry) =>
            entry.url ===
            `http://localhost:3000/${locale}/defects/mercedes-benz`
        )
      ).toBe(true);
      expect(
        entries.some(
          (entry) =>
            entry.url ===
            `http://localhost:3000/${locale}/defects/mercedes-benz/classe-c`
        )
      ).toBe(true);
    }
  });
});
