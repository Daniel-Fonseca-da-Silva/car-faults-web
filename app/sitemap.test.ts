import { locales } from "@/i18n/locales";
import { vehicles } from "@/lib/mocks/vehicles";

import sitemap from "./sitemap";

describe("sitemap", () => {
  it("includes every static path for every locale", () => {
    const entries = sitemap();
    const staticPaths = ["", "/recalls", "/defects", "/compare", "/about"];

    for (const locale of locales) {
      for (const path of staticPaths) {
        expect(
          entries.some((entry) => entry.url === `http://localhost:3000/${locale}${path}`)
        ).toBe(true);
      }
    }
  });

  it("includes a URL for every vehicle in every locale", () => {
    const entries = sitemap();

    for (const locale of locales) {
      for (const vehicle of vehicles) {
        const expectedUrl = `http://localhost:3000/${locale}/defects/${vehicle.makeSlug}/${vehicle.modelSlug}/${vehicle.year}`;
        expect(entries.some((entry) => entry.url === expectedUrl)).toBe(true);
      }
    }
  });

  it("returns the expected total number of entries", () => {
    const entries = sitemap();
    const staticCount = locales.length * 5;
    const vehicleCount = locales.length * vehicles.length;

    expect(entries).toHaveLength(staticCount + vehicleCount);
  });
});
