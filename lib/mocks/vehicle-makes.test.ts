import {
  EUROPEAN_VEHICLE_MAKES,
  filterVehicleMakes,
} from "./vehicle-makes";

describe("EUROPEAN_VEHICLE_MAKES", () => {
  it("is not empty", () => {
    expect(EUROPEAN_VEHICLE_MAKES.length).toBeGreaterThan(0);
  });

  it("has no duplicates", () => {
    const unique = new Set(EUROPEAN_VEHICLE_MAKES);
    expect(unique.size).toBe(EUROPEAN_VEHICLE_MAKES.length);
  });

  it("is sorted alphabetically", () => {
    const sorted = [...EUROPEAN_VEHICLE_MAKES].sort((a, b) =>
      a.localeCompare(b)
    );
    expect(EUROPEAN_VEHICLE_MAKES).toEqual(sorted);
  });

  it.each([
    "Volkswagen",
    "Peugeot",
    "Ford",
    "Citroën",
    "Dacia",
    "Honda",
    "Toyota",
    "Fiat",
    "Renault",
    "Hyundai",
    "Tesla",
    "BYD",
    "Jeep",
    "Nissan",
    "BMW",
    "Bentley",
    "Rolls-Royce",
    "Aston Martin",
    "Audi",
    "Mercedes-Benz",
    "Dodge",
    "GMC",
    "Kia",
    "Mitsubishi",
    "Opel",
    "SEAT",
    "Ferrari",
    "Porsche",
    "Alpine",
    "Lamborghini",
    "Maserati",
    "Volvo",
    "Aixam",
    "Lada",
    "Ligier",
    "Microcar",
    "Aiways",
    "Changan",
    "Dongfeng",
    "MG",
    "Cadillac",
    "CFMOTO",
    "Harley-Davidson",
    "John Deere",
    "Keeway",
    "Land Rover",
    "Smart",
    "Suzuki",
    "Triumph",
    "Yamaha",
  ])("contains %s", (make) => {
    expect(EUROPEAN_VEHICLE_MAKES).toContain(make);
  });
});

describe("filterVehicleMakes", () => {
  it("returns all makes when the query is empty", () => {
    expect(filterVehicleMakes("")).toEqual([...EUROPEAN_VEHICLE_MAKES]);
  });

  it("returns all makes when the query is only whitespace", () => {
    expect(filterVehicleMakes("   ")).toEqual([...EUROPEAN_VEHICLE_MAKES]);
  });

  it("filters case-insensitively", () => {
    expect(filterVehicleMakes("volkswagen")).toEqual(["Volkswagen"]);
    expect(filterVehicleMakes("VOLKSWAGEN")).toEqual(["Volkswagen"]);
    expect(filterVehicleMakes("VoLkSwAgEn")).toEqual(["Volkswagen"]);
  });

  it("matches a substring anywhere in the make name", () => {
    expect(filterVehicleMakes("benz")).toEqual(["Mercedes-Benz"]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterVehicleMakes("Skoda")).toEqual([]);
  });
});
