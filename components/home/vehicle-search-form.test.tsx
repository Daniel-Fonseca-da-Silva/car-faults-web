import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { VehicleSearchForm } from "./vehicle-search-form";

const pushMock = jest.fn();
let turnstileOnSuccess: ((token: string) => void) | undefined;
let turnstileOnExpire: (() => void) | undefined;
let turnstileOnError: (() => void) | undefined;

jest.mock("next-intl", () => ({
  useLocale: () => "en-GB",
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
      verifying: "Verifying...",
      validation: "Enter at least a make or a model.",
      captchaError: "Verification failed. Please complete the challenge again.",
    };
    return (key: string) => dict[key] ?? key;
  },
}));

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/components/security/turnstile-widget", () => ({
  TurnstileWidget: ({
    onSuccess,
    onExpire,
    onError,
  }: {
    onSuccess: (token: string) => void;
    onExpire?: () => void;
    onError?: () => void;
  }) => {
    turnstileOnSuccess = onSuccess;
    turnstileOnExpire = onExpire;
    turnstileOnError = onError;
    return <div data-testid="turnstile-widget" />;
  },
}));

async function completeCaptcha(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => expect(turnstileOnSuccess).toBeDefined());
  act(() => turnstileOnSuccess?.("test-turnstile-token"));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Search faults" })
    ).toBeEnabled()
  );
  await user.click(screen.getByRole("button", { name: "Search faults" }));
}

describe("VehicleSearchForm", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    pushMock.mockClear();
    turnstileOnSuccess = undefined;
    turnstileOnExpire = undefined;
    turnstileOnError = undefined;
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
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

  it("does not show the Turnstile widget until all 5 fields are filled in", async () => {
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    expect(screen.queryByTestId("turnstile-widget")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Make"), "Volkswagen");
    await user.type(screen.getByLabelText("Model"), "Golf");
    await user.type(screen.getByLabelText("Year"), "2018");
    await user.type(screen.getByLabelText("Engine"), "2.0 TDI");
    await user.selectOptions(screen.getByLabelText("Fuel"), "diesel");

    expect(screen.getByTestId("turnstile-widget")).toBeInTheDocument();
  });

  it("disables submit for a full search until the Turnstile challenge succeeds", async () => {
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    await user.type(screen.getByLabelText("Make"), "Volkswagen");
    await user.type(screen.getByLabelText("Model"), "Golf");
    await user.type(screen.getByLabelText("Year"), "2018");
    await user.type(screen.getByLabelText("Engine"), "2.0 TDI");
    await user.selectOptions(screen.getByLabelText("Fuel"), "diesel");

    expect(screen.getByRole("button", { name: "Search faults" })).toBeDisabled();
  });

  it("prepares the lookup and navigates to the returned href once the fields and captcha are complete", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        href: "/defects/volkswagen/golf/2018?brand=Volkswagen&model=Golf&engine=2.0+TDI&fuelType=diesel",
      }),
    });
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    await user.type(screen.getByLabelText("Make"), "Volkswagen");
    await user.type(screen.getByLabelText("Model"), "Golf");
    await user.type(screen.getByLabelText("Year"), "2018");
    await user.type(screen.getByLabelText("Engine"), "2.0 TDI");
    await user.selectOptions(screen.getByLabelText("Fuel"), "diesel");

    await completeCaptcha(user);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/lookup/prepare",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          brand: "Volkswagen",
          model: "Golf",
          year: 2018,
          engine: "2.0 TDI",
          fuelType: "diesel",
          doors: null,
          language: "en-GB",
          turnstileToken: "test-turnstile-token",
        }),
      })
    );
    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith(
        "/defects/volkswagen/golf/2018?brand=Volkswagen&model=Golf&engine=2.0+TDI&fuelType=diesel"
      )
    );
  });

  it("includes doors in the prepare request when selected", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        href: "/defects/volkswagen/golf/2018?brand=Volkswagen&model=Golf&engine=2.0+TDI&fuelType=diesel&doors=5",
      }),
    });
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    await user.type(screen.getByLabelText("Make"), "Volkswagen");
    await user.type(screen.getByLabelText("Model"), "Golf");
    await user.type(screen.getByLabelText("Year"), "2018");
    await user.type(screen.getByLabelText("Engine"), "2.0 TDI");
    await user.selectOptions(screen.getByLabelText("Fuel"), "diesel");
    await user.selectOptions(screen.getByLabelText("Doors (optional)"), "5");

    await completeCaptcha(user);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/lookup/prepare",
      expect.objectContaining({
        body: JSON.stringify({
          brand: "Volkswagen",
          model: "Golf",
          year: 2018,
          engine: "2.0 TDI",
          fuelType: "diesel",
          doors: 5,
          language: "en-GB",
          turnstileToken: "test-turnstile-token",
        }),
      })
    );
    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith(
        "/defects/volkswagen/golf/2018?brand=Volkswagen&model=Golf&engine=2.0+TDI&fuelType=diesel&doors=5"
      )
    );
  });

  it("shows an error and resets the widget when the prepare request fails", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) });
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    await user.type(screen.getByLabelText("Make"), "Volkswagen");
    await user.type(screen.getByLabelText("Model"), "Golf");
    await user.type(screen.getByLabelText("Year"), "2018");
    await user.type(screen.getByLabelText("Engine"), "2.0 TDI");
    await user.selectOptions(screen.getByLabelText("Fuel"), "diesel");

    await completeCaptcha(user);

    await waitFor(() =>
      expect(
        screen.getByText(
          "Verification failed. Please complete the challenge again."
        )
      ).toBeInTheDocument()
    );
    expect(pushMock).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Search faults" })
    ).toBeDisabled();
  });

  it("clears the token when the Turnstile challenge expires", async () => {
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    await user.type(screen.getByLabelText("Make"), "Volkswagen");
    await user.type(screen.getByLabelText("Model"), "Golf");
    await user.type(screen.getByLabelText("Year"), "2018");
    await user.type(screen.getByLabelText("Engine"), "2.0 TDI");
    await user.selectOptions(screen.getByLabelText("Fuel"), "diesel");

    await waitFor(() => expect(turnstileOnSuccess).toBeDefined());
    act(() => turnstileOnSuccess?.("test-turnstile-token"));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Search faults" })
      ).toBeEnabled()
    );

    act(() => turnstileOnExpire?.());

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Search faults" })
      ).toBeDisabled()
    );
  });

  it("clears the token when the Turnstile widget errors", async () => {
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    await user.type(screen.getByLabelText("Make"), "Volkswagen");
    await user.type(screen.getByLabelText("Model"), "Golf");
    await user.type(screen.getByLabelText("Year"), "2018");
    await user.type(screen.getByLabelText("Engine"), "2.0 TDI");
    await user.selectOptions(screen.getByLabelText("Fuel"), "diesel");

    await waitFor(() => expect(turnstileOnSuccess).toBeDefined());
    act(() => turnstileOnSuccess?.("test-turnstile-token"));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Search faults" })
      ).toBeEnabled()
    );

    act(() => turnstileOnError?.());

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Search faults" })
      ).toBeDisabled()
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
    expect(fetchMock).not.toHaveBeenCalled();
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

  it("navigates to the vehicle detail page with the electric sentinel when fuel is electric and engine is left blank", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        href: "/defects/tesla/model-3/2022?brand=Tesla&model=Model+3&engine=electric&fuelType=electric",
      }),
    });
    const user = userEvent.setup();
    render(<VehicleSearchForm />);

    await user.type(screen.getByLabelText("Make"), "Tesla");
    await user.type(screen.getByLabelText("Model"), "Model 3");
    await user.type(screen.getByLabelText("Year"), "2022");
    await user.selectOptions(screen.getByLabelText("Fuel"), "electric");

    await completeCaptcha(user);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/lookup/prepare",
      expect.objectContaining({
        body: JSON.stringify({
          brand: "Tesla",
          model: "Model 3",
          year: 2022,
          engine: "electric",
          fuelType: "electric",
          doors: null,
          language: "en-GB",
          turnstileToken: "test-turnstile-token",
        }),
      })
    );
    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith(
        "/defects/tesla/model-3/2022?brand=Tesla&model=Model+3&engine=electric&fuelType=electric"
      )
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
    expect(fetchMock).not.toHaveBeenCalled();
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
