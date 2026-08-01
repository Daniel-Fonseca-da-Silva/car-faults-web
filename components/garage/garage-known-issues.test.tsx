import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import type { KnownIssue } from "@/types/lookup";
import type { UserVehicleDetail } from "@/types/user-vehicle";

import { GarageKnownIssues } from "./garage-known-issues";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "garage.issues.title": "Problemas conhecidos",
      "garage.issues.empty":
        "Ainda não há problemas conhecidos para este veículo.",
      "garage.issues.viewDetails": "Ver detalhes",
      "faults.severity.high": "Alta",
      "faults.severity.critical": "Crítica",
    };
    return (key: string) => dict[`${namespace}.${key}`] ?? key;
  },
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children?: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const knownIssue: KnownIssue = {
  id: "ki-1",
  title: "Problematic gearbox",
  description: "Synchros wear out prematurely.",
  severity: "high",
  typicalKm: 120000,
  sources: null,
  fixes: [],
};

const baseVehicle: UserVehicleDetail = {
  id: "uv-1",
  vehicleModelId: "vm-1",
  brand: "Volkswagen",
  model: "Polo",
  year: 2001,
  engine: "1.0",
  name: "Meu Polo",
  doors: 3,
  fuelType: "gasoline",
  imageUrl: null,
  knownIssuesCount: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  knownIssues: [knownIssue],
};

describe("GarageKnownIssues", () => {
  it("renders each known issue with its title, description and severity", async () => {
    const jsx = await GarageKnownIssues({ vehicle: baseVehicle });
    render(jsx);

    expect(screen.getByText("Problematic gearbox")).toBeInTheDocument();
    expect(
      screen.getByText("Synchros wear out prematurely.")
    ).toBeInTheDocument();
    expect(screen.getByText("Alta")).toBeInTheDocument();
  });

  it("links to the vehicle defects page when fuelType is present", async () => {
    const jsx = await GarageKnownIssues({ vehicle: baseVehicle });
    render(jsx);

    const link = screen.getByRole("link", { name: /Ver detalhes/ });
    expect(link).toHaveAttribute(
      "href",
      "/defects/volkswagen/polo/2001?brand=Volkswagen&model=Polo&engine=1.0&fuelType=gasoline&doors=3"
    );
  });

  it("omits the details link when there is no linked catalog model", async () => {
    const jsx = await GarageKnownIssues({
      vehicle: { ...baseVehicle, fuelType: null },
    });
    render(jsx);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows the empty state when there are no known issues", async () => {
    const jsx = await GarageKnownIssues({
      vehicle: { ...baseVehicle, knownIssues: [] },
    });
    render(jsx);

    expect(
      screen.getByText("Ainda não há problemas conhecidos para este veículo.")
    ).toBeInTheDocument();
  });
});
