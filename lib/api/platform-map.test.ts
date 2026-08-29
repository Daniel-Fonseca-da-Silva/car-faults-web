import { mapTopFault } from "./platform-map";

describe("mapTopFault", () => {
  it("maps the API DTO to a TopFaultEntry", () => {
    expect(
      mapTopFault({
        id: "ki-1",
        faultTitle: "Timing chain",
        severity: "high",
        reportCount: 10,
        vehicle: {
          brand: "Volkswagen",
          model: "Golf",
          yearFrom: 2015,
          engine: "1.6 TDI",
          fuelType: "diesel",
          doors: 5,
        },
      })
    ).toEqual({
      id: "ki-1",
      faultTitle: "Timing chain",
      severity: "high",
      reportCount: 10,
      vehicle: {
        make: "Volkswagen",
        model: "Golf",
        year: 2015,
        engine: "1.6 TDI",
        fuelType: "diesel",
        doors: 5,
      },
    });
  });
});
