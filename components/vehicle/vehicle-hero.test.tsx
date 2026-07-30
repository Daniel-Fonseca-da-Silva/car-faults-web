import { render, screen } from "@testing-library/react";

import type { VehicleLookup } from "@/types/lookup";

import { VehicleHero } from "./vehicle-hero";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "faults.vehicle.eyebrow": "Veículo encontrado",
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

describe("VehicleHero", () => {
  it("renders the eyebrow and the brand/model title", async () => {
    const jsx = await VehicleHero({ vehicle: baseVehicle });
    render(jsx);

    expect(screen.getByText("Veículo encontrado")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Volkswagen Polo"
    );
    expect(screen.getByAltText("Volkswagen Polo")).toBeInTheDocument();
  });

  it("shows the vehicle's specific name below the title when it differs from brand + model", async () => {
    const jsx = await VehicleHero({ vehicle: baseVehicle });
    render(jsx);

    expect(screen.getByText("Polo 6N1")).toBeInTheDocument();
  });

  it("omits the name line when the vehicle has no name", async () => {
    const jsx = await VehicleHero({ vehicle: { ...baseVehicle, name: null } });
    render(jsx);

    expect(screen.queryByText("Polo 6N1")).not.toBeInTheDocument();
  });
});
