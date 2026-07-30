import { findVehicle, listMakes, relatedVehicles, vehicles } from "./vehicles";

describe("vehicles mock data", () => {
  it("finds a vehicle by make, model and year", () => {
    const vehicle = findVehicle("volkswagen", "golf", 2018);

    expect(vehicle).toBeDefined();
    expect(vehicle?.make).toBe("Volkswagen");
    expect(vehicle?.model).toBe("Golf");
    expect(vehicle?.year).toBe(2018);
  });

  it("returns undefined when no vehicle matches", () => {
    expect(findVehicle("tesla", "model-3", 2018)).toBeUndefined();
  });

  it("lists other model years for the same make/model, excluding itself", () => {
    const vehicle = findVehicle("volkswagen", "golf", 2018);
    expect(vehicle).toBeDefined();

    const related = relatedVehicles(vehicle!);

    expect(related.every((entry) => entry.year !== 2018)).toBe(true);
    expect(related.every((entry) => entry.modelSlug === "golf")).toBe(true);
    expect(related.map((entry) => entry.year).sort()).toEqual([2019, 2020]);
  });

  it("returns an empty list of related vehicles when there is only one model year", () => {
    const vehicle = findVehicle("bmw", "serie-3", 2016);
    expect(vehicle).toBeDefined();

    expect(relatedVehicles(vehicle!)).toEqual([]);
  });

  it("lists unique, sorted make slugs", () => {
    const makes = listMakes();

    expect(makes).toEqual([...new Set(makes)].sort());
    expect(makes).toContain("volkswagen");
    expect(makes.length).toBeLessThanOrEqual(vehicles.length);
  });

  it("every vehicle fixture has at least one engine and fault", () => {
    for (const vehicle of vehicles) {
      expect(vehicle.engines.length).toBeGreaterThan(0);
      expect(vehicle.faults.length).toBeGreaterThan(0);
    }
  });
});
