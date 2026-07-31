import { buildLookupHref } from "./build-lookup-href";

describe("buildLookupHref", () => {
  it("builds the SEO path with the lookup identity in the query", () => {
    const href = buildLookupHref({
      brand: "Volkswagen",
      model: "Polo",
      year: 2001,
      engine: "1.0",
      fuelType: "gasoline",
    });

    expect(href).toBe(
      "/defects/volkswagen/polo/2001?brand=Volkswagen&model=Polo&engine=1.0&fuelType=gasoline"
    );
  });

  it("includes doors in the query when given", () => {
    const href = buildLookupHref({
      brand: "Renault",
      model: "Clio",
      year: 2016,
      engine: "1.5 dCi",
      fuelType: "diesel",
      doors: 5,
    });

    expect(href).toBe(
      "/defects/renault/clio/2016?brand=Renault&model=Clio&engine=1.5+dCi&fuelType=diesel&doors=5"
    );
  });

  it("omits doors from the query when null", () => {
    const href = buildLookupHref({
      brand: "Fiat",
      model: "Uno",
      year: 2007,
      engine: "1.0",
      fuelType: "gasoline",
      doors: null,
    });

    expect(href).not.toContain("doors=");
  });
});
