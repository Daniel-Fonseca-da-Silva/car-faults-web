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
      statusInactive: "Database unavailable",
      "fields.make": "Make",
      "fields.makePlaceholder": "e.g. Volkswagen",
      "fields.makeNoResults": "No matching make. Your typed name will be used.",
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

type TestUser = ReturnType<typeof userEvent.setup>;

function createUser(): TestUser {
  // Controlled Base UI combobox drops keystrokes with the default typing delay.
  return userEvent.setup({ delay: null });
}

async function completeCaptcha(user: TestUser) {
  await waitFor(() => expect(turnstileOnSuccess).toBeDefined());
  act(() => turnstileOnSuccess?.("test-turnstile-token"));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Search faults" })
    ).toBeEnabled()
  );
  await user.click(screen.getByRole("button", { name: "Search faults" }));
}

/**
 * Set the make in one input event and close the popup so later fields keep focus.
 * Character-by-character typing races the controlled Combobox and leaves partial values.
 */
async function chooseMake(user: TestUser, make: string) {
  const input = screen.getByLabelText("Make");
  await user.click(input);
  await user.paste(make);
  await waitFor(() => expect(input).toHaveValue(make));
  await user.keyboard("{Escape}");
}

async function fillFullSearchFields(
  user: TestUser,
  options: {
    make?: string;
    model?: string;
    year?: string;
    engine?: string;
    fuel?: string;
    doors?: string;
  } = {}
) {
  const {
    make = "Volkswagen",
    model = "Golf",
    year = "2018",
    engine = "2.0 TDI",
    fuel = "diesel",
    doors,
  } = options;

  await chooseMake(user, make);
  await user.type(screen.getByLabelText("Model"), model);
  await user.type(screen.getByLabelText("Year"), year);
  if (fuel !== "electric") {
    await user.type(screen.getByLabelText("Engine"), engine);
  }
  await user.selectOptions(screen.getByLabelText("Fuel"), fuel);
  if (doors) {
    await user.selectOptions(screen.getByLabelText("Doors (optional)"), doors);
  }
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

  it("shows the active status badge when the database is up", () => {
    render(<VehicleSearchForm isDatabaseUp={true} />);

    expect(screen.getByText("Database active")).toBeInTheDocument();
    expect(screen.queryByText("Database unavailable")).not.toBeInTheDocument();
  });

  it("shows the inactive status badge when the database is down", () => {
    render(<VehicleSearchForm isDatabaseUp={false} />);

    expect(screen.getByText("Database unavailable")).toBeInTheDocument();
    expect(screen.queryByText("Database active")).not.toBeInTheDocument();
  });

  it("shows a validation error when submitting without make or model", async () => {
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(
      screen.getByText("Enter at least a make or a model.")
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("does not show the Turnstile widget until all 5 fields are filled in", async () => {
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    expect(screen.queryByTestId("turnstile-widget")).not.toBeInTheDocument();

    await fillFullSearchFields(user);

    expect(screen.getByTestId("turnstile-widget")).toBeInTheDocument();
  });

  it("disables submit for a full search until the Turnstile challenge succeeds", async () => {
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await fillFullSearchFields(user);

    expect(screen.getByRole("button", { name: "Search faults" })).toBeDisabled();
  });

  it("prepares the lookup and navigates to the returned href once the fields and captcha are complete", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        href: "/defects/volkswagen/golf/2018/diesel/2-0-tdi",
      }),
    });
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await fillFullSearchFields(user);

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
        "/defects/volkswagen/golf/2018/diesel/2-0-tdi"
      )
    );
  });

  it("includes doors in the prepare request when selected", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        href: "/defects/volkswagen/golf/2018/diesel/2-0-tdi?doors=5",
      }),
    });
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await fillFullSearchFields(user, { doors: "5" });

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
        "/defects/volkswagen/golf/2018/diesel/2-0-tdi?doors=5"
      )
    );
  });

  it("shows an error and resets the widget when the prepare request fails", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) });
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await fillFullSearchFields(user);

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
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await fillFullSearchFields(user);

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
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await fillFullSearchFields(user);

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
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await chooseMake(user, "Volkswagen");
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
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await user.type(screen.getByLabelText("Model"), "Golf");
    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(pushMock).toHaveBeenCalledWith({
      pathname: "/defects",
      query: { model: "Golf" },
    });
  });

  it("hides the engine field once electric fuel is selected", async () => {
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    expect(screen.getByLabelText("Engine")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Fuel"), "electric");

    expect(screen.queryByLabelText("Engine")).not.toBeInTheDocument();
  });

  it("navigates to the vehicle detail page with the electric sentinel when fuel is electric and engine is left blank", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        href: "/defects/tesla/model-3/2022/electric/electric",
      }),
    });
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await fillFullSearchFields(user, {
      make: "Tesla",
      model: "Model 3",
      year: "2022",
      fuel: "electric",
    });

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
        "/defects/tesla/model-3/2022/electric/electric"
      )
    );
  });

  it("still requires the engine field for a full submit when fuel is not electric", async () => {
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await chooseMake(user, "Volkswagen");
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
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await user.type(screen.getByLabelText("Engine"), "2.0 TDI");
    await user.selectOptions(screen.getByLabelText("Fuel"), "electric");
    await user.selectOptions(screen.getByLabelText("Fuel"), "diesel");

    expect(screen.getByLabelText("Engine")).toHaveValue("2.0 TDI");
  });

  it("selects a make from the dropdown list and uses it in the partial search", async () => {
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    const makeInput = screen.getByLabelText("Make");
    await user.click(makeInput);
    await user.paste("Volks");
    await user.click(await screen.findByRole("option", { name: "Volkswagen" }));
    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(pushMock).toHaveBeenCalledWith({
      pathname: "/defects",
      query: { make: "Volkswagen" },
    });
  });

  it("keeps a typed make that does not match any known brand for the partial search", async () => {
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    const makeInput = screen.getByLabelText("Make");
    await user.click(makeInput);
    await user.paste("Skodaa");

    expect(
      await screen.findByText(
        "No matching make. Your typed name will be used."
      )
    ).toBeInTheDocument();

    // Close the open combobox so the form is no longer inert.
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(pushMock).toHaveBeenCalledWith({
      pathname: "/defects",
      query: { make: "Skodaa" },
    });
  });

  it("includes the engine, fuel and doors fields in the query when filled in", async () => {
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await chooseMake(user, "Volkswagen");
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
