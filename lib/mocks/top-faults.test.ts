import { topFaults } from "./top-faults";

describe("topFaults mock data", () => {
  it("exports a non-empty list of top fault entries", () => {
    expect(topFaults.length).toBeGreaterThan(0);
  });

  it("gives every entry a unique id and complete vehicle details", () => {
    const ids = topFaults.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const entry of topFaults) {
      expect(entry.vehicle.make).toBeTruthy();
      expect(entry.vehicle.model).toBeTruthy();
      expect(entry.faultTitle).toBeTruthy();
      expect(entry.reportCount).toBeGreaterThan(0);
    }
  });
});
