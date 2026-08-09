import { buildLookupHref } from "./build-lookup-href";

describe("buildLookupHref", () => {
  it("builds the SEO path with fuel type and engine as path segments", () => {
    const href = buildLookupHref({
      brand: "Volkswagen",
      model: "Polo",
      year: 2001,
      engine: "1.0",
      fuelType: "gasoline",
    });

    expect(href).toBe("/defects/volkswagen/polo/2001/gasoline/1-0");
  });

  it("slugifies brand, model and engine independently", () => {
    const href = buildLookupHref({
      brand: "Mercedes-Benz",
      model: "Classe C",
      year: 2017,
      engine: "2.1 CDI",
      fuelType: "diesel",
    });

    expect(href).toBe("/defects/mercedes-benz/classe-c/2017/diesel/2-1-cdi");
  });

  it("appends doors as a query param when given", () => {
    const href = buildLookupHref({
      brand: "Renault",
      model: "Clio",
      year: 2016,
      engine: "1.5 dCi",
      fuelType: "diesel",
      doors: 5,
    });

    expect(href).toBe("/defects/renault/clio/2016/diesel/1-5-dci?doors=5");
  });

  it("omits the doors query param when doors is null", () => {
    const href = buildLookupHref({
      brand: "Fiat",
      model: "Uno",
      year: 2007,
      engine: "1.0",
      fuelType: "gasoline",
      doors: null,
    });

    expect(href).not.toContain("doors=");
    expect(href).toBe("/defects/fiat/uno/2007/gasoline/1-0");
  });

  it("omits the doors query param when doors is undefined", () => {
    const href = buildLookupHref({
      brand: "Fiat",
      model: "Uno",
      year: 2007,
      engine: "1.0",
      fuelType: "gasoline",
    });

    expect(href).not.toContain("?");
  });
});
