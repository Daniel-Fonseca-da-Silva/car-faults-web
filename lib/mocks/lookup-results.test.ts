import {
  countSeverities,
  findLookup,
  listLookupStaticParams,
  lookupResults,
} from "./lookup-results";

describe("lookup-results mock data", () => {
  it("finds a lookup by make, model and a year within its production range", () => {
    const lookup = findLookup("volkswagen", "polo", 1996);

    expect(lookup).toBeDefined();
    expect(lookup?.vehicle.brand).toBe("Volkswagen");
    expect(lookup?.vehicle.model).toBe("Polo");
  });

  it("matches the first and last year of the production range", () => {
    expect(findLookup("volkswagen", "polo", 1994)).toBeDefined();
    expect(findLookup("volkswagen", "polo", 1999)).toBeDefined();
    expect(findLookup("volkswagen", "polo", 1993)).toBeUndefined();
    expect(findLookup("volkswagen", "polo", 2000)).toBeUndefined();
  });

  it("returns undefined when no lookup matches", () => {
    expect(findLookup("tesla", "model-3", 2022)).toBeUndefined();
  });

  it("generates one static param per year in every vehicle's production range", () => {
    const params = listLookupStaticParams();

    const poloParams = params.filter(
      (param) => param.make === "volkswagen" && param.model === "polo"
    );
    expect(poloParams.map((param) => param.year)).toEqual([
      "1994",
      "1995",
      "1996",
      "1997",
      "1998",
      "1999",
    ]);
  });

  it("counts known issues by severity, defaulting missing severities to zero", () => {
    const lookup = findLookup("renault", "clio", 2017);
    expect(lookup).toBeDefined();

    const counts = countSeverities(lookup!.knownIssues);

    expect(counts).toEqual({ low: 0, medium: 1, high: 0, critical: 1 });
  });

  it("every lookup fixture has at least one known issue", () => {
    for (const result of lookupResults) {
      expect(result.knownIssues.length).toBeGreaterThan(0);
    }
  });
});
