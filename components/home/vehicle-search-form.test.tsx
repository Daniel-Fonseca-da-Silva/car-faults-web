import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { VehicleSearchForm } from "./vehicle-search-form";

const pushMock = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => {
    const dict: Record<string, string> = {
      title: "Find your vehicle's faults",
      statusActive: "Database active",
      "fields.make": "Make",
      "fields.makePlaceholder": "e.g. Volkswagen",
      "fields.model": "Model",
      "fields.modelPlaceholder": "e.g. Golf",
      "fields.year": "Year",
      "fields.yearPlaceholder": "e.g. 2018",
      "fields.engine": "Engine",
      "fields.enginePlaceholder": "e.g. 2.0 TDI",
      "fields.fuel": "Fuel",
      "fields.fuelPlaceholder": "Select fuel type",
      "fields.doors": "Doors (optional)",
      "fields.doorsPlaceholder": "Select number of doors",
      "fuelOptions.petrol": "Petrol",
      "fuelOptions.diesel": "Diesel",
      "fuelOptions.hybrid": "Hybrid",
      "fuelOptions.electric": "Electric",
      submit: "Search faults",
      validation: "Enter at least a make or a model.",
    };
    return (key: string) => dict[key] ?? key;
  },
}));

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("VehicleSearchForm", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("shows a validation error when submitting without make or model", async () => {
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(
      screen.getByText("Enter at least a make or a model.")
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("navigates straight to the vehicle presentation page when make, model and year are all filled in", async () => {
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    await user.type(screen.getByLabelText("Make"), "Volkswagen");
    await user.type(screen.getByLabelText("Model"), "Golf");
    await user.type(screen.getByLabelText("Year"), "2018");
    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(pushMock).toHaveBeenCalledWith("/defects/volkswagen/golf/2018");
  });

  it("allows submitting with only the model filled in", async () => {
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    await user.type(screen.getByLabelText("Model"), "Golf");
    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(pushMock).toHaveBeenCalledWith({
      pathname: "/defects",
      query: { model: "Golf" },
    });
  });

  it("includes the engine, fuel and doors fields in the query when filled in", async () => {
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    await user.type(screen.getByLabelText("Make"), "Volkswagen");
    await user.type(screen.getByLabelText("Engine"), "2.0 TDI");
    await user.selectOptions(screen.getByLabelText("Fuel"), "diesel");
    await user.selectOptions(screen.getByLabelText("Doors (optional)"), "5");
    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(pushMock).toHaveBeenCalledWith({
      pathname: "/defects",
      query: {
        make: "Volkswagen",
        engine: "2.0 TDI",
        fuel: "diesel",
        doors: "5",
      },
    });
  });
});
