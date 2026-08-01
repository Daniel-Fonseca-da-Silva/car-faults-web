import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import type { UserVehicle } from "@/types/user-vehicle";

import { GarageVehicleList } from "./garage-vehicle-list";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "garage.list.title": "Os teus veículos favoritos",
      "garage.list.empty": "Ainda não tens veículos na garagem…",
      "garage.list.knownIssuesCount": "{count} defeitos",
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
    href: string | { pathname: string; query?: Record<string, string> };
    children?: ReactNode;
  }) => {
    const resolvedHref =
      typeof href === "string"
        ? href
        : `${href.pathname}?${new URLSearchParams(href.query).toString()}`;
    return (
      <a href={resolvedHref} {...props}>
        {children}
      </a>
    );
  },
}));

jest.mock("@/components/garage/garage-remove-vehicle-button", () => ({
  GarageRemoveVehicleButton: ({
    vehicleId,
    vehicleLabel,
  }: {
    vehicleId: string;
    vehicleLabel: string;
  }) => <div>Remove:{vehicleId}:{vehicleLabel}</div>,
}));

const linkedVehicle: UserVehicle = {
  id: "uv-polo",
  vehicleModelId: "vm-1",
  brand: "Volkswagen",
  model: "Polo",
  year: 1996,
  engine: "1.0",
  name: "Polo 6N1",
  doors: 3,
  fuelType: "gasoline",
  imageUrl: null,
  knownIssuesCount: 2,
  createdAt: "2026-01-12T09:30:00.000Z",
  updatedAt: "2026-01-12T09:30:00.000Z",
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
  imageUrl: null,
  knownIssuesCount: 0,
  createdAt: "2026-02-03T14:15:00.000Z",
  updatedAt: "2026-02-03T14:15:00.000Z",
};

describe("GarageVehicleList", () => {
  it("renders the empty state when there are no vehicles", async () => {
    const jsx = await GarageVehicleList({
      vehicles: [],
      selectedVehicleId: null,
      locale: "pt-PT",
    });
    render(jsx);

    expect(
      screen.getByText("Ainda não tens veículos na garagem…")
    ).toBeInTheDocument();
  });

  it("links each vehicle row to the garage page with the vehicleId query", async () => {
    const jsx = await GarageVehicleList({
      vehicles: [linkedVehicle],
      selectedVehicleId: "uv-polo",
      locale: "pt-PT",
    });
    render(jsx);

    expect(screen.getByText("Volkswagen Polo")).toBeInTheDocument();
    expect(screen.getByText("1996")).toBeInTheDocument();
    expect(
      screen.getByText("Volkswagen Polo").closest("a")
    ).toHaveAttribute("href", "/garage?vehicleId=uv-polo");
  });

  it("shows the known issues badge only when the count is greater than zero", async () => {
    const jsx = await GarageVehicleList({
      vehicles: [linkedVehicle, unlinkedVehicle],
      selectedVehicleId: null,
      locale: "pt-PT",
    });
    render(jsx);

    expect(screen.getByText("2 defeitos")).toBeInTheDocument();
    expect(screen.queryByText("0 defeitos")).not.toBeInTheDocument();
  });

  it("renders a remove control for every vehicle", async () => {
    const jsx = await GarageVehicleList({
      vehicles: [linkedVehicle, unlinkedVehicle],
      selectedVehicleId: null,
      locale: "pt-PT",
    });
    render(jsx);

    expect(
      screen.getByText("Remove:uv-polo:Volkswagen Polo")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Remove:uv-uno:Fiat Uno Mille")
    ).toBeInTheDocument();
  });
});
