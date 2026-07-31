import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import type { UserVehicle } from "@/types/user-vehicle";

import { ProfileSavedVehicles } from "./profile-saved-vehicles";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "profile.vehicles.title": "Veículos salvos",
      "profile.vehicles.count": "{count} veículos",
      "profile.vehicles.empty": "Ainda não guardou nenhum veículo.",
      "profile.vehicles.knownIssuesCount": "{count} defeitos",
      "profile.vehicles.viewDetails": "Ver detalhes de {brand} {model}",
    };
    return (key: string, values?: Record<string, unknown>) => {
      const template = dict[`${namespace}.${key}`] ?? key;
      return values
        ? template.replace(/\{(\w+)\}/g, (_, token) => String(values[token]))
        : template;
    };
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

const linkedVehicle: UserVehicle = {
  id: "uv-polo",
  vehicleModelId: "veh-polo-6n1",
  brand: "Volkswagen",
  model: "Polo",
  year: 1996,
  engine: "1.0",
  name: "Polo 6N1",
  doors: 3,
  fuelType: "gasoline",
  createdAt: "2026-01-12T09:30:00.000Z",
  updatedAt: "2026-01-12T09:30:00.000Z",
  knownIssuesCount: 2,
};

const unlinkedVehicle: UserVehicle = {
  id: "uv-uno",
  vehicleModelId: null,
  brand: "Fiat",
  model: "Uno Mille",
  year: 2007,
  engine: "1.0",
  name: null,
  doors: 5,
  fuelType: null,
  createdAt: "2026-02-03T14:15:00.000Z",
  updatedAt: "2026-02-03T14:15:00.000Z",
  knownIssuesCount: 4,
};

describe("ProfileSavedVehicles", () => {
  it("links to the vehicle page when fuelType is present", async () => {
    const jsx = await ProfileSavedVehicles({ vehicles: [linkedVehicle] });
    render(jsx);

    const link = screen.getByRole("link", {
      name: "Ver detalhes de Volkswagen Polo",
    });
    expect(link).toHaveAttribute(
      "href",
      "/defects/volkswagen/polo/1996?brand=Volkswagen&model=Polo&engine=1.0&fuelType=gasoline&doors=3"
    );
    expect(screen.getByText("Volkswagen Polo")).toBeInTheDocument();
    expect(screen.getByText("1996")).toBeInTheDocument();
    expect(screen.getByText("2 defeitos")).toBeInTheDocument();
  });

  it("renders vehicles without a fuelType (no linked vehicle model) as plain, unlinked rows", async () => {
    const jsx = await ProfileSavedVehicles({ vehicles: [unlinkedVehicle] });
    render(jsx);

    expect(screen.getByText("Fiat Uno Mille")).toBeInTheDocument();
    expect(screen.getByText("4 defeitos")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the vehicle count in the header", async () => {
    const jsx = await ProfileSavedVehicles({
      vehicles: [linkedVehicle, unlinkedVehicle],
    });
    render(jsx);

    expect(screen.getByText("2 veículos")).toBeInTheDocument();
  });

  it("renders the empty state when there are no saved vehicles", async () => {
    const jsx = await ProfileSavedVehicles({ vehicles: [] });
    render(jsx);

    expect(
      screen.getByText("Ainda não guardou nenhum veículo.")
    ).toBeInTheDocument();
  });
});
