import { render, screen } from "@testing-library/react";

import type { UserVehicleDetail } from "@/types/user-vehicle";

import { GarageHero } from "./garage-hero";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "garage.hero.eyebrow": "Garagem",
      "garage.hero.emptyTitle": "A tua garagem está vazia",
      "garage.hero.fallbackAlt": "Cena de garagem clássica",
    };
    return (key: string) => dict[`${namespace}.${key}`] ?? key;
  },
}));

const vehicle: UserVehicleDetail = {
  id: "uv-1",
  vehicleModelId: "vm-1",
  brand: "Volkswagen",
  model: "Polo",
  year: 2001,
  engine: "1.0",
  name: "Meu Polo",
  doors: 3,
  fuelType: "gasoline",
  imageUrl: "https://cdn.example.com/vehicle-models/vw-polo.webp",
  knownIssuesCount: 2,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  knownIssues: [],
};

describe("GarageHero", () => {
  it("renders the eyebrow and the vehicle's brand/model/year", async () => {
    const jsx = await GarageHero({ vehicle });
    render(jsx);

    expect(screen.getByText("Garagem")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Volkswagen Polo2001"
    );
    expect(screen.getByAltText("Volkswagen Polo")).toBeInTheDocument();
  });

  it("shows the empty-state title and fallback alt text when there is no vehicle selected", async () => {
    const jsx = await GarageHero({ vehicle: null });
    render(jsx);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "A tua garagem está vazia"
    );
    expect(screen.getByAltText("Cena de garagem clássica")).toBeInTheDocument();
  });

  it("does not render a year line when there is no vehicle selected", async () => {
    const jsx = await GarageHero({ vehicle: null });
    render(jsx);

    expect(screen.queryByText("2001")).not.toBeInTheDocument();
  });
});
