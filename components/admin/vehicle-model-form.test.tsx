import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { VehicleModelForm } from "./vehicle-model-form";
import type { AdminVehicleModel } from "@/types/admin";

const dict: Record<string, string> = {
  "vehicleForm.brand": "Brand",
  "vehicleForm.brandPlaceholder": "e.g. Volkswagen",
  "vehicleForm.brandNoResults": "No matching brand. Your typed name will be used.",
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
  "vehicleForm.uploading": "Uploading…",
  "vehicleForm.uploadSucceeded": "Photo uploaded successfully.",
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

const uploadVehicleImageMock = jest.fn();

jest.mock("@/lib/api/storage", () => ({
  uploadVehicleImage: (...args: unknown[]) => uploadVehicleImageMock(...args),
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

// Controlled Base UI combobox drops keystrokes with the default typing delay,
// same workaround used in vehicle-search-form.test.tsx.
function createUser() {
  return userEvent.setup({ delay: null });
}

// fireEvent.change has no inputType, so the Base UI combobox treats it like
// autofill and updates inputValue without opening the listbox (fast, stable
// under coverage, mirrors vehicle-search-form.test.tsx's chooseMake).
async function chooseBrand(brand: string) {
  const input = screen.getByLabelText("Brand");
  fireEvent.change(input, { target: { value: brand } });
  await waitFor(() => expect(input).toHaveValue(brand));
}

function getFileInput(): HTMLInputElement {
  return document.querySelector('input[type="file"]') as HTMLInputElement;
}

describe("VehicleModelForm", () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    createAdminVehicleModelMock.mockReset();
    updateAdminVehicleModelMock.mockReset();
    uploadVehicleImageMock.mockReset();
  });

  it("creates a vehicle model and navigates to its detail page", async () => {
    const user = createUser();
    createAdminVehicleModelMock.mockResolvedValue({ id: "vm-new" });
    render(<VehicleModelForm />);

    await chooseBrand("Volkswagen");
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
    const user = createUser();
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
    const user = createUser();
    createAdminVehicleModelMock.mockRejectedValue(new Error("network"));
    render(<VehicleModelForm />);

    await chooseBrand("Volkswagen");
    await user.type(screen.getByLabelText("Model"), "Polo");
    await user.type(screen.getByLabelText("Year from"), "2001");
    await user.type(screen.getByLabelText("Engine"), "1.0");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(
      await screen.findByText("Something went wrong. Please try again.")
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("accepts a brand typed outside the known makes list", async () => {
    const user = createUser();
    createAdminVehicleModelMock.mockResolvedValue({ id: "vm-new" });
    render(<VehicleModelForm />);

    await chooseBrand("Skodaa");

    await user.type(screen.getByLabelText("Model"), "Custom");
    await user.type(screen.getByLabelText("Year from"), "2010");
    await user.type(screen.getByLabelText("Engine"), "1.6");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(createAdminVehicleModelMock).toHaveBeenCalledWith(
      expect.objectContaining({ brand: "Skodaa" })
    );
  });

  it("rejects an oversized image and does not call the upload API", () => {
    render(<VehicleModelForm />);

    const bigFile = new File([new Uint8Array(6 * 1024 * 1024)], "big.jpg", {
      type: "image/jpeg",
    });
    fireEvent.change(getFileInput(), { target: { files: [bigFile] } });

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent("The image must be smaller than 5 MB.");
    expect(uploadVehicleImageMock).not.toHaveBeenCalled();
  });

  it("rejects an unsupported image type and does not call the upload API", () => {
    render(<VehicleModelForm />);

    const file = new File(["data"], "doc.pdf", { type: "application/pdf" });
    fireEvent.change(getFileInput(), { target: { files: [file] } });

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent("Please choose a JPEG, PNG or WEBP image.");
    expect(uploadVehicleImageMock).not.toHaveBeenCalled();
  });

  it("shows a loading state while the image uploads", async () => {
    let resolveUpload: (result: { url: string }) => void = () => {};
    uploadVehicleImageMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpload = resolve;
        })
    );
    render(<VehicleModelForm />);

    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    fireEvent.change(getFileInput(), { target: { files: [file] } });

    expect(await screen.findByText("Uploading…")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Uploading…" })
    ).toBeDisabled();

    resolveUpload({ url: "https://cdn.example.com/vehicles/photo.jpg" });

    await waitFor(() =>
      expect(screen.queryByText("Uploading…")).not.toBeInTheDocument()
    );
  });

  it("shows an accessible success indicator once the image finishes uploading", async () => {
    uploadVehicleImageMock.mockResolvedValue({
      url: "https://cdn.example.com/vehicles/photo.jpg",
    });
    render(<VehicleModelForm />);

    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    fireEvent.change(getFileInput(), { target: { files: [file] } });

    expect(
      await screen.findByRole("status", {
        name: "Photo uploaded successfully.",
      })
    ).toBeInTheDocument();
  });

  it("shows an inline error when the upload API call fails", async () => {
    uploadVehicleImageMock.mockRejectedValue(new Error("network"));
    render(<VehicleModelForm />);

    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    fireEvent.change(getFileInput(), { target: { files: [file] } });

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Something went wrong. Please try again.");
    expect(
      screen.queryByRole("status", { name: "Photo uploaded successfully." })
    ).not.toBeInTheDocument();
  });

  it("clears the success indicator when a new file is selected", async () => {
    uploadVehicleImageMock.mockResolvedValue({
      url: "https://cdn.example.com/vehicles/photo.jpg",
    });
    render(<VehicleModelForm />);

    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    fireEvent.change(getFileInput(), { target: { files: [file] } });
    await screen.findByRole("status", { name: "Photo uploaded successfully." });

    const invalidFile = new File(["data"], "doc.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(getFileInput(), { target: { files: [invalidFile] } });

    expect(
      screen.queryByRole("status", { name: "Photo uploaded successfully." })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("alert")
    ).toHaveTextContent("Please choose a JPEG, PNG or WEBP image.");
  });

  it("clears the image error and success state when removing the photo", async () => {
    const user = createUser();
    uploadVehicleImageMock.mockResolvedValue({
      url: "https://cdn.example.com/vehicles/photo.jpg",
    });
    render(<VehicleModelForm />);

    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    fireEvent.change(getFileInput(), { target: { files: [file] } });
    await screen.findByRole("status", { name: "Photo uploaded successfully." });

    await user.click(screen.getByRole("button", { name: "Remove photo" }));

    expect(
      screen.queryByRole("status", { name: "Photo uploaded successfully." })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove photo" })
    ).not.toBeInTheDocument();
  });
});
