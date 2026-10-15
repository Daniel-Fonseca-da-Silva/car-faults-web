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
      nextCursor: null,
    });

    const entries = await sitemap();
    const staticPaths = [
      "",
      "/defects",
      "/about",
      "/support",
      "/privacy",
      "/account-deletion",
    ];

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
      nextCursor: null,
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
        nextCursor: "c2",
      })
      .mockResolvedValueOnce({
        items: [vehicles[1]],
        nextCursor: null,
      });

    await sitemap();

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

  it("returns the expected total number of entries", async () => {
    getPlatformVehiclesMock.mockResolvedValue({
      items: vehicles,
      nextCursor: null,
    });

    const entries = await sitemap();
    const staticCount = locales.length * 6;
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
      nextCursor: null,
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

  it("lists vehicle and hub URLs only for the locales where the vehicles have content", async () => {
    getPlatformVehiclesMock.mockResolvedValue({
      items: [
        { ...vehicles[0], locales: ["pt-PT", "pt-BR"] },
        { ...vehicles[1], locales: ["en-US"] },
      ],
      nextCursor: null,
    });

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);
    const localesOf = (path: string) =>
      locales.filter((locale) =>
        urls.includes(`http://localhost:3000/${locale}${path}`)
      );

    expect(localesOf("/defects/volkswagen/golf/2018/diesel/2-0-tdi")).toEqual([
      "pt-PT",
      "pt-BR",
    ]);
    expect(localesOf("/defects/volkswagen")).toEqual(["pt-PT", "pt-BR"]);
    expect(localesOf("/defects/volkswagen/golf")).toEqual(["pt-PT", "pt-BR"]);
    expect(
      localesOf("/defects/mercedes-benz/classe-c/2017/diesel/c220-d-2-1")
    ).toEqual(["en-US"]);
    expect(localesOf("/defects/mercedes-benz")).toEqual(["en-US"]);
    expect(entries).toHaveLength(locales.length * 6 + 2 * 3 + 1 * 3);
  });

  it("merges a hub's locales across all of its vehicles", async () => {
    getPlatformVehiclesMock.mockResolvedValue({
      items: [
        { ...vehicles[0], locales: ["pt-PT"] },
        { ...vehicles[0], engine: "1.6 TDI", locales: ["en-US"] },
      ],
      nextCursor: null,
    });

    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain(
      "http://localhost:3000/pt-PT/defects/volkswagen/golf"
    );
    expect(urls).toContain(
      "http://localhost:3000/en-US/defects/volkswagen/golf"
    );
    expect(urls).not.toContain(
      "http://localhost:3000/de-DE/defects/volkswagen/golf"
    );
  });

  describe("lastModified", () => {
    const entryFor = (entries: Awaited<ReturnType<typeof sitemap>>, path: string) =>
      entries.find((entry) => entry.url === `http://localhost:3000/pt-PT${path}`);

    it("uses each vehicle's own updatedAt and the latest one for its hubs", async () => {
      getPlatformVehiclesMock.mockResolvedValue({
        items: [
          { ...vehicles[0], updatedAt: "2026-03-01T00:00:00.000Z" },
          {
            ...vehicles[0],
            engine: "1.6 TDI",
            updatedAt: "2026-05-01T00:00:00.000Z",
          },
          { ...vehicles[1], updatedAt: "2026-01-01T00:00:00.000Z" },
        ],
        nextCursor: null,
      });

      const entries = await sitemap();

      expect(
        entryFor(entries, "/defects/volkswagen/golf/2018/diesel/2-0-tdi")
          ?.lastModified
      ).toEqual(new Date("2026-03-01T00:00:00.000Z"));
      expect(
        entryFor(entries, "/defects/volkswagen/golf/2018/diesel/1-6-tdi")
          ?.lastModified
      ).toEqual(new Date("2026-05-01T00:00:00.000Z"));
      expect(entryFor(entries, "/defects/volkswagen/golf")?.lastModified).toEqual(
        new Date("2026-05-01T00:00:00.000Z")
      );
      expect(entryFor(entries, "/defects/volkswagen")?.lastModified).toEqual(
        new Date("2026-05-01T00:00:00.000Z")
      );
      expect(entryFor(entries, "/defects/mercedes-benz")?.lastModified).toEqual(
        new Date("2026-01-01T00:00:00.000Z")
      );
    });

    it("dates the catalog listing pages by the latest vehicle change and leaves other static pages undated", async () => {
      getPlatformVehiclesMock.mockResolvedValue({
        items: [
          { ...vehicles[0], updatedAt: "2026-03-01T00:00:00.000Z" },
          { ...vehicles[1], updatedAt: "2026-04-01T00:00:00.000Z" },
        ],
        nextCursor: null,
      });

      const entries = await sitemap();
      const latest = new Date("2026-04-01T00:00:00.000Z");

      expect(entryFor(entries, "")?.lastModified).toEqual(latest);
      expect(entryFor(entries, "/defects")?.lastModified).toEqual(latest);
      expect(entryFor(entries, "/about")).not.toHaveProperty("lastModified");
      expect(entryFor(entries, "/privacy")).not.toHaveProperty("lastModified");
    });

    it("omits lastModified when the API sends no updatedAt or an invalid one", async () => {
      getPlatformVehiclesMock.mockResolvedValue({
        items: [vehicles[0], { ...vehicles[1], updatedAt: "not-a-date" }],
        nextCursor: null,
      });

      const entries = await sitemap();

      expect(entries.some((entry) => "lastModified" in entry)).toBe(false);
    });
  });
});
