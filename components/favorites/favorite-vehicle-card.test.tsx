import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import type { FavoriteVehicle } from "@/types/favorite-vehicle";

import { FavoriteVehicleCard } from "./favorite-vehicle-card";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (key === "viewVehicle") {
      return `Ver problemas de ${values?.brand} ${values?.model}`;
    }
    return key;
  },
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const vehicle: FavoriteVehicle = {
  vehicleModelId: "vm-1",
  brand: "Volkswagen",
  model: "Polo",
  engine: "1.0",
  fuelType: "gasoline",
  doors: 3,
  imageUrl: null,
  year: 1996,
};

describe("FavoriteVehicleCard", () => {
  it("links the card to the public vehicle profile", () => {
    render(<FavoriteVehicleCard vehicle={vehicle} />);

    expect(
      screen.getByRole("link", { name: "Ver problemas de Volkswagen Polo" })
    ).toHaveAttribute(
      "href",
      "/defects/volkswagen/polo/1996/gasoline/1-0?doors=3"
    );
    expect(screen.getByText("Volkswagen Polo")).toBeInTheDocument();
    expect(screen.getByText("1996 · 1.0")).toBeInTheDocument();
  });

  it("renders without a link when fuel type is missing", () => {
    render(
      <FavoriteVehicleCard vehicle={{ ...vehicle, fuelType: null }} />
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Volkswagen Polo")).toBeInTheDocument();
  });
});
