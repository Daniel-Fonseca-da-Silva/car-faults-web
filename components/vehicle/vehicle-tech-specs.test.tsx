import { render, screen } from "@testing-library/react";

import type { VehicleLookup } from "@/types/lookup";

import { VehicleTechSpecs } from "./vehicle-tech-specs";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "faults.vehicle.years": "Anos",
      "faults.vehicle.engine": "Motor",
      "faults.vehicle.fuel": "Combustível",
      "faults.vehicle.doors": "Portas",
      "faults.vehicle.power": "Potência",
      "faults.vehicle.fuelTypes.gasoline": "Gasolina",
      "faults.vehicle.fuelTypes.diesel": "Diesel",
      "faults.vehicle.fuelTypes.electric": "Elétrico",
    };
    return (key: string) => dict[`${namespace}.${key}`] ?? key;
  },
}));

const baseVehicle: VehicleLookup = {
  id: "veh-polo-6n1",
  brand: "Volkswagen",
  model: "Polo",
  name: "Polo 6N1",
  yearFrom: 1994,
  yearTo: 1999,
  engine: "1.0",
  doors: 3,
  fuelType: "gasoline",
  imageUrl: null,
  techSpecs: { power_hp: 50 },
};

describe("VehicleTechSpecs", () => {
  it("renders all five spec tiles with formatted values", async () => {
    const jsx = await VehicleTechSpecs({ vehicle: baseVehicle });
    render(jsx);

    expect(screen.getByText("1994 – 1999")).toBeInTheDocument();
    expect(screen.getByText("1.0")).toBeInTheDocument();
    expect(screen.getByText("Gasolina")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("50 hp")).toBeInTheDocument();
  });

  it("shows a single year when yearTo matches yearFrom", async () => {
    const jsx = await VehicleTechSpecs({
      vehicle: { ...baseVehicle, yearTo: 1994 },
    });
    render(jsx);

    expect(screen.getByText("1994")).toBeInTheDocument();
  });

  it("shows the translated fuel type instead of the raw sentinel for electric vehicles", async () => {
    const jsx = await VehicleTechSpecs({
      vehicle: {
        ...baseVehicle,
        engine: "electric",
        fuelType: "electric",
        techSpecs: null,
      },
    });
    render(jsx);

    expect(screen.getAllByText("Elétrico")).toHaveLength(2);
    expect(screen.queryByText("electric")).not.toBeInTheDocument();
  });

  it("falls back to a dash for missing fuel type, doors and power", async () => {
    const jsx = await VehicleTechSpecs({
      vehicle: {
        ...baseVehicle,
        fuelType: null,
        doors: null,
        techSpecs: null,
      },
    });
    render(jsx);

    expect(screen.getAllByText("—")).toHaveLength(3);
  });
});
