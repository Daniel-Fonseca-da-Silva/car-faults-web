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
      "fuelOptions.gasoline": "Petrol",
      "fuelOptions.diesel": "Diesel",
      "fuelOptions.electric": "Electric",
      "fuelOptions.gpl": "LPG",
      "fuelOptions.hybrid": "Hybrid",
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

  it("navigates straight to the vehicle detail page when all 5 fields are filled in", async () => {
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    await user.type(screen.getByLabelText("Make"), "Volkswagen");
    await user.type(screen.getByLabelText("Model"), "Golf");
    await user.type(screen.getByLabelText("Year"), "2018");
    await user.type(screen.getByLabelText("Engine"), "2.0 TDI");
    await user.selectOptions(screen.getByLabelText("Fuel"), "diesel");
    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(pushMock).toHaveBeenCalledWith(
      "/defects/volkswagen/golf/2018?brand=Volkswagen&model=Golf&engine=2.0+TDI&fuelType=diesel"
    );
  });

  it("includes doors in the detail href when selected", async () => {
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    await user.type(screen.getByLabelText("Make"), "Volkswagen");
    await user.type(screen.getByLabelText("Model"), "Golf");
    await user.type(screen.getByLabelText("Year"), "2018");
    await user.type(screen.getByLabelText("Engine"), "2.0 TDI");
    await user.selectOptions(screen.getByLabelText("Fuel"), "diesel");
    await user.selectOptions(screen.getByLabelText("Doors (optional)"), "5");
    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(pushMock).toHaveBeenCalledWith(
      "/defects/volkswagen/golf/2018?brand=Volkswagen&model=Golf&engine=2.0+TDI&fuelType=diesel&doors=5"
    );
  });

  it("falls back to the hub with a query when make, model and year are filled in but engine or fuel are missing", async () => {
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    await user.type(screen.getByLabelText("Make"), "Volkswagen");
    await user.type(screen.getByLabelText("Model"), "Golf");
    await user.type(screen.getByLabelText("Year"), "2018");
    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(pushMock).toHaveBeenCalledWith({
      pathname: "/defects",
      query: { make: "Volkswagen", model: "Golf", year: "2018" },
    });
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

  it("hides the engine field once electric fuel is selected", async () => {
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    expect(screen.getByLabelText("Engine")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Fuel"), "electric");

    expect(screen.queryByLabelText("Engine")).not.toBeInTheDocument();
  });

  it("navigates straight to the vehicle detail page with the electric sentinel when fuel is electric and engine is left blank", async () => {
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    await user.type(screen.getByLabelText("Make"), "Tesla");
    await user.type(screen.getByLabelText("Model"), "Model 3");
    await user.type(screen.getByLabelText("Year"), "2022");
    await user.selectOptions(screen.getByLabelText("Fuel"), "electric");
    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(pushMock).toHaveBeenCalledWith(
      "/defects/tesla/model-3/2022?brand=Tesla&model=Model+3&engine=electric&fuelType=electric"
    );
  });

  it("still requires the engine field for a full submit when fuel is not electric", async () => {
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    await user.type(screen.getByLabelText("Make"), "Volkswagen");
    await user.type(screen.getByLabelText("Model"), "Golf");
    await user.type(screen.getByLabelText("Year"), "2018");
    await user.selectOptions(screen.getByLabelText("Fuel"), "diesel");
    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(pushMock).toHaveBeenCalledWith({
      pathname: "/defects",
      query: {
        make: "Volkswagen",
        model: "Golf",
        year: "2018",
        fuel: "diesel",
      },
    });
  });

  it("restores the engine field when fuel changes away from electric", async () => {
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    await user.type(screen.getByLabelText("Engine"), "2.0 TDI");
    await user.selectOptions(screen.getByLabelText("Fuel"), "electric");
    await user.selectOptions(screen.getByLabelText("Fuel"), "diesel");

    expect(screen.getByLabelText("Engine")).toHaveValue("2.0 TDI");
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
