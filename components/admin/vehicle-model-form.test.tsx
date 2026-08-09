import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { VehicleModelForm } from "./vehicle-model-form";
import type { AdminVehicleModel } from "@/types/admin";

const dict: Record<string, string> = {
  "vehicleForm.brand": "Brand",
  "vehicleForm.model": "Model",
  "vehicleForm.name": "Display name",
  "vehicleForm.yearFrom": "Year from",
  "vehicleForm.yearTo": "Year to",
  "vehicleForm.engine": "Engine",
  "vehicleForm.doors": "Doors",
  "vehicleForm.fuelType": "Fuel type",
  "vehicleForm.fuelTypeNone": "Not set",
  "vehicleForm.fuelTypeGasoline": "Gasoline",
  "vehicleForm.fuelTypeDiesel": "Diesel",
  "vehicleForm.fuelTypeElectric": "Electric",
  "vehicleForm.fuelTypeGpl": "LPG",
  "vehicleForm.fuelTypeHybrid": "Hybrid",
  "vehicleForm.image": "Catalog photo",
  "vehicleForm.uploadImage": "Upload photo",
  "vehicleForm.removeImage": "Remove photo",
  "vehicleForm.invalidImageType": "Please choose a JPEG, PNG or WEBP image.",
  "vehicleForm.imageTooLarge": "The image must be smaller than 5 MB.",
  "common.save": "Save",
  "common.saving": "Saving…",
  "common.create": "Create",
  "common.creating": "Creating…",
  "common.error": "Something went wrong. Please try again.",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => dict[key] ?? key,
}));

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

const createAdminVehicleModelMock = jest.fn();
const updateAdminVehicleModelMock = jest.fn();

jest.mock("@/lib/api/admin-vehicles", () => ({
  createAdminVehicleModel: (...args: unknown[]) =>
    createAdminVehicleModelMock(...args),
  updateAdminVehicleModel: (...args: unknown[]) =>
    updateAdminVehicleModelMock(...args),
}));

jest.mock("@/lib/api/storage", () => ({
  uploadVehicleImage: jest.fn(),
}));

const vehicle: AdminVehicleModel = {
  id: "vm-1",
  brand: "Volkswagen",
  model: "Polo",
  name: null,
  yearFrom: 2001,
  yearTo: 2001,
  engine: "1.0",
  doors: null,
  fuelType: null,
  imageUrl: null,
  techSpecs: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("VehicleModelForm", () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    createAdminVehicleModelMock.mockReset();
    updateAdminVehicleModelMock.mockReset();
  });

  it("creates a vehicle model and navigates to its detail page", async () => {
    const user = userEvent.setup();
    createAdminVehicleModelMock.mockResolvedValue({ id: "vm-new" });
    render(<VehicleModelForm />);

    await user.type(screen.getByLabelText("Brand"), "Volkswagen");
    await user.type(screen.getByLabelText("Model"), "Polo");
    await user.type(screen.getByLabelText("Year from"), "2001");
    await user.type(screen.getByLabelText("Engine"), "1.0");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(createAdminVehicleModelMock).toHaveBeenCalledWith(
      expect.objectContaining({
        brand: "Volkswagen",
        model: "Polo",
        yearFrom: 2001,
        engine: "1.0",
      })
    );
    expect(pushMock).toHaveBeenCalledWith("/admin/vehicles/vm-new");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("pre-fills the form with an existing vehicle and updates it", async () => {
    const user = userEvent.setup();
    updateAdminVehicleModelMock.mockResolvedValue({ id: "vm-1" });
    render(<VehicleModelForm vehicle={vehicle} />);

    expect(screen.getByLabelText("Brand")).toHaveValue("Volkswagen");
    expect(screen.getByLabelText("Model")).toHaveValue("Polo");

    await user.clear(screen.getByLabelText("Model"));
    await user.type(screen.getByLabelText("Model"), "Golf");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(updateAdminVehicleModelMock).toHaveBeenCalledWith(
      "vm-1",
      expect.objectContaining({ model: "Golf" })
    );
    expect(pushMock).toHaveBeenCalledWith("/admin/vehicles/vm-1");
    expect(
      await screen.findByRole("button", { name: "Save" })
    ).toBeEnabled();
  });

  it("shows an error and stays editable when saving fails", async () => {
    const user = userEvent.setup();
    createAdminVehicleModelMock.mockRejectedValue(new Error("network"));
    render(<VehicleModelForm />);

    await user.type(screen.getByLabelText("Brand"), "Volkswagen");
    await user.type(screen.getByLabelText("Model"), "Polo");
    await user.type(screen.getByLabelText("Year from"), "2001");
    await user.type(screen.getByLabelText("Engine"), "1.0");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(
      await screen.findByText("Something went wrong. Please try again.")
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
