import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { VehicleDeleteButton } from "./vehicle-delete-button";

const dict: Record<string, string> = {
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "vehicleDetail.deleteVehicle": "Delete vehicle",
  "vehicleDetail.deleteConfirmTitle": "Delete this vehicle?",
  "vehicleDetail.deleteConfirmDescription":
    "This removes {vehicle} and hides it from public lookups. This cannot be undone from here.",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    const template = dict[key] ?? key;
    return values
      ? template.replace(/\{(\w+)\}/g, (_, token) => String(values[token]))
      : template;
  },
}));

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

const deleteAdminVehicleModelMock = jest.fn();

jest.mock("@/lib/api/admin-vehicles", () => ({
  deleteAdminVehicleModel: (...args: unknown[]) =>
    deleteAdminVehicleModelMock(...args),
}));

describe("VehicleDeleteButton", () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    deleteAdminVehicleModelMock.mockReset();
    deleteAdminVehicleModelMock.mockResolvedValue(undefined);
  });

  it("opens a confirmation dialog before deleting the vehicle", async () => {
    const user = userEvent.setup();
    render(
      <VehicleDeleteButton vehicleId="vm-1" vehicleLabel="Volkswagen Polo" />
    );

    await user.click(screen.getByRole("button", { name: "Delete vehicle" }));

    expect(screen.getByText("Delete this vehicle?")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This removes Volkswagen Polo and hides it from public lookups. This cannot be undone from here."
      )
    ).toBeInTheDocument();
  });

  it("closes the dialog when cancelled without deleting", async () => {
    const user = userEvent.setup();
    render(
      <VehicleDeleteButton vehicleId="vm-1" vehicleLabel="Volkswagen Polo" />
    );

    await user.click(screen.getByRole("button", { name: "Delete vehicle" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByText("Delete this vehicle?")).not.toBeInTheDocument();
    expect(deleteAdminVehicleModelMock).not.toHaveBeenCalled();
  });

  it("deletes the vehicle and navigates back to the list when confirmed", async () => {
    const user = userEvent.setup();
    render(
      <VehicleDeleteButton vehicleId="vm-1" vehicleLabel="Volkswagen Polo" />
    );

    await user.click(screen.getByRole("button", { name: "Delete vehicle" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(deleteAdminVehicleModelMock).toHaveBeenCalledWith("vm-1");
    expect(pushMock).toHaveBeenCalledWith("/admin/vehicles");
    expect(refreshMock).toHaveBeenCalled();
  });
});
