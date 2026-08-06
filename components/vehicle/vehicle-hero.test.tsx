import { render, screen } from "@testing-library/react";

import type { VehicleLookup } from "@/types/lookup";
import type { UserProfile } from "@/types/user";

import { VehicleHero } from "./vehicle-hero";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "faults.vehicle.eyebrow": "Veículo encontrado",
    };
    return (key: string) => dict[`${namespace}.${key}`] ?? key;
  },
}));

jest.mock("@/components/vehicle/vehicle-garage-actions", () => ({
  VehicleGarageActions: ({
    vehicleModelId,
    vehicleLabel,
  }: {
    vehicleModelId: string;
    vehicleLabel: string;
  }) => (
    <div data-testid="vehicle-garage-actions">
      {vehicleModelId}:{vehicleLabel}
    </div>
  ),
}));

const currentUser: UserProfile = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana Silva",
  role: "user",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const baseHeroProps = {
  year: 1996,
  currentUser,
  garageVehicleId: null,
  isFavorited: false,
  currentPath: "/pt-PT/defects/vw/polo/1996",
};

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
    const jsx = await VehicleHero({ vehicle: baseVehicle, ...baseHeroProps });
    render(jsx);

    expect(screen.getByText("Veículo encontrado")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Volkswagen Polo"
    );
    expect(screen.getByAltText("Volkswagen Polo")).toBeInTheDocument();
  });

  it("shows the vehicle's specific name below the title when it differs from brand + model", async () => {
    const jsx = await VehicleHero({ vehicle: baseVehicle, ...baseHeroProps });
    render(jsx);

    expect(screen.getByText("Polo 6N1")).toBeInTheDocument();
  });

  it("omits the name line when the vehicle has no name", async () => {
    const jsx = await VehicleHero({
      vehicle: { ...baseVehicle, name: null },
      ...baseHeroProps,
    });
    render(jsx);

    expect(screen.queryByText("Polo 6N1")).not.toBeInTheDocument();
  });

  it("passes the vehicle model id and title through to the garage actions", async () => {
    const jsx = await VehicleHero({ vehicle: baseVehicle, ...baseHeroProps });
    render(jsx);

    expect(screen.getByTestId("vehicle-garage-actions")).toHaveTextContent(
      "veh-polo-6n1:Volkswagen Polo"
    );
  });
});
