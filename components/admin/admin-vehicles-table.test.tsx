import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import type { AdminVehicleModel } from "@/types/admin";

import { AdminVehiclesTable } from "./admin-vehicles-table";

jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
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

const vehicle: AdminVehicleModel = {
  id: "veh-1",
  brand: "Volkswagen",
  model: "Polo",
  name: null,
  yearFrom: 1994,
  yearTo: 1999,
  engine: "1.0",
  doors: 3,
  fuelType: "gasoline",
  imageUrl: null,
  techSpecs: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("AdminVehiclesTable", () => {
  it("renders the empty state when there are no vehicles", () => {
    render(
      <AdminVehiclesTable initialItems={[]} initialCursor={null} />
    );

    expect(screen.getByText("admin.vehicles.empty")).toBeInTheDocument();
  });

  it("renders rows and year ranges for the first page", () => {
    render(
      <AdminVehiclesTable
        initialItems={[vehicle, { ...vehicle, id: "veh-2", yearTo: 1994 }]}
        initialCursor={null}
      />
    );

    const brandLinks = screen.getAllByRole("link", { name: "Volkswagen" });
    expect(brandLinks).toHaveLength(2);
    expect(brandLinks[0]).toHaveAttribute("href", "/admin/vehicles/veh-1");
    expect(brandLinks[1]).toHaveAttribute("href", "/admin/vehicles/veh-2");
    expect(screen.getByText("1994–1999")).toBeInTheDocument();
    expect(screen.getByText("1994")).toBeInTheDocument();
  });
});
