import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { VehicleSearchForm } from "./vehicle-search-form";

const FULL_SEARCH_TEST_TIMEOUT_MS = 15_000;
const REQUIRED_ERROR_TEXT = "Please fill in this field.";
const YEAR_RANGE_ERROR_TEXT = "Enter a year between 1900 and 2027.";
const CAPTCHA_ERROR_TEXT =
  "Verification failed. Please complete the challenge again.";
const SEARCH_ERROR_TEXT =
  "Something went wrong with your search. Please try again.";

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
      "errors.required": REQUIRED_ERROR_TEXT,
      "errors.yearRange": YEAR_RANGE_ERROR_TEXT,
      captchaError: CAPTCHA_ERROR_TEXT,
      searchError: SEARCH_ERROR_TEXT,
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

function labelledControl(labelText: string): HTMLElement {
  return screen.getByLabelText(labelText, { exact: false });
}

function queryLabelledControl(labelText: string): HTMLElement | null {
  return screen.queryByLabelText(labelText, { exact: false });
}

function fieldGroup(labelText: string): HTMLElement {
  const control = labelledControl(labelText);
  const label = document.querySelector(`label[for="${control.id}"]`);
  const group = label?.parentElement;
  if (!(group instanceof HTMLElement)) {
    throw new Error(`No field group found for label "${labelText}"`);
  }
  return group;
}

function hasRequiredError(labelText: string): boolean {
  return within(fieldGroup(labelText)).queryByRole("alert") !== null;
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
 * Set the make via a single change event. Opening the Base UI Combobox popup
 * (paste/type + option click) is slow and flaky under coverage: the popup can
 * leave the form inert and push the full-search flows past Jest's 5s timeout.
 * fireEvent.change has no inputType, so Base UI treats it like autofill and
 * updates inputValue without opening the listbox.
 */
async function chooseMake(_user: TestUser, make: string) {
  const input = labelledControl("Make");
  fireEvent.change(input, { target: { value: make } });
  await waitFor(() => expect(input).toHaveValue(make));
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
  await user.type(labelledControl("Model"), model);
  await user.type(labelledControl("Year"), year);
  if (fuel !== "electric") {
    await user.type(labelledControl("Engine"), engine);
  }
  await user.selectOptions(labelledControl("Fuel"), fuel);
  if (doors) {
    await user.selectOptions(labelledControl("Doors (optional)"), doors);
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

  it("shows errors on every required field when submitting an empty form", async () => {
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(screen.getAllByText(REQUIRED_ERROR_TEXT)).toHaveLength(5);
    expect(hasRequiredError("Make")).toBe(true);
    expect(hasRequiredError("Model")).toBe(true);
    expect(hasRequiredError("Year")).toBe(true);
    expect(hasRequiredError("Fuel")).toBe(true);
    expect(hasRequiredError("Engine")).toBe(true);
    expect(pushMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not show the Turnstile widget until all required fields are filled in", async () => {
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

  it(
    "prepares the lookup and navigates to the returned href once the fields and captcha are complete",
    async () => {
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
    },
    FULL_SEARCH_TEST_TIMEOUT_MS
  );

  it(
    "includes doors in the prepare request when selected",
    async () => {
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
    },
    FULL_SEARCH_TEST_TIMEOUT_MS
  );

  it(
    "shows the captcha error and resets the widget when the API reports TURNSTILE_REQUIRED",
    async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => ({ error: "TURNSTILE_REQUIRED" }),
      });
      const user = createUser();
      render(<VehicleSearchForm isDatabaseUp={true} />);

      await fillFullSearchFields(user);

      await completeCaptcha(user);

      await waitFor(() =>
        expect(screen.getByText(CAPTCHA_ERROR_TEXT)).toBeInTheDocument()
      );
      expect(pushMock).not.toHaveBeenCalled();
      expect(
        screen.getByRole("button", { name: "Search faults" })
      ).toBeDisabled();
      expect(document.querySelector("svg.animate-spin")).not.toBeInTheDocument();
    },
    FULL_SEARCH_TEST_TIMEOUT_MS
  );

  it(
    "shows a generic search error without blaming the captcha when the lookup fails for another reason",
    async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => ({ error: "LOOKUP_FAILED" }),
      });
      const user = createUser();
      render(<VehicleSearchForm isDatabaseUp={true} />);

      await fillFullSearchFields(user);

      await completeCaptcha(user);

      await waitFor(() =>
        expect(screen.getByText(SEARCH_ERROR_TEXT)).toBeInTheDocument()
      );
      expect(screen.queryByText(CAPTCHA_ERROR_TEXT)).not.toBeInTheDocument();
      expect(pushMock).not.toHaveBeenCalled();
      expect(
        screen.getByRole("button", { name: "Search faults" })
      ).toBeEnabled();
      expect(document.querySelector("svg.animate-spin")).not.toBeInTheDocument();
    },
    FULL_SEARCH_TEST_TIMEOUT_MS
  );

  it(
    "shows a spinner while the lookup is pending and keeps it visible after navigating away on success",
    async () => {
      let resolveFetch:
        | ((value: { ok: boolean; json: () => Promise<{ href: string }> }) => void)
        | undefined;
      fetchMock.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          })
      );
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

      await user.click(screen.getByRole("button", { name: "Search faults" }));

      const pendingButton = await screen.findByRole("button", {
        name: "Verifying...",
      });
      expect(pendingButton).toBeDisabled();
      expect(pendingButton.querySelector("svg.animate-spin")).toBeInTheDocument();

      resolveFetch?.({
        ok: true,
        json: async () => ({
          href: "/defects/volkswagen/golf/2018/diesel/2-0-tdi",
        }),
      });

      await waitFor(() =>
        expect(pushMock).toHaveBeenCalledWith(
          "/defects/volkswagen/golf/2018/diesel/2-0-tdi"
        )
      );

      // The form does not clear isSubmitting on success — it stays visible
      // until router.push unmounts the form on navigation.
      expect(
        screen.getByRole("button", { name: "Verifying..." })
      ).toBeInTheDocument();
      expect(document.querySelector("svg.animate-spin")).toBeInTheDocument();
    },
    FULL_SEARCH_TEST_TIMEOUT_MS
  );

  it(
    "clears the captcha error once Turnstile succeeds again after a TURNSTILE_REQUIRED failure",
    async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => ({ error: "TURNSTILE_REQUIRED" }),
      });
      const user = createUser();
      render(<VehicleSearchForm isDatabaseUp={true} />);

      await fillFullSearchFields(user);
      await completeCaptcha(user);

      await waitFor(() =>
        expect(screen.getByText(CAPTCHA_ERROR_TEXT)).toBeInTheDocument()
      );

      act(() => turnstileOnSuccess?.("fresh-token"));

      await waitFor(() =>
        expect(screen.queryByText(CAPTCHA_ERROR_TEXT)).not.toBeInTheDocument()
      );
    },
    FULL_SEARCH_TEST_TIMEOUT_MS
  );

  it(
    "shows a year range error instead of a captcha error when the year is out of range",
    async () => {
      const user = createUser();
      render(<VehicleSearchForm isDatabaseUp={true} />);

      await fillFullSearchFields(user, { year: "1500" });
      await completeCaptcha(user);

      expect(
        await screen.findByText(YEAR_RANGE_ERROR_TEXT)
      ).toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(pushMock).not.toHaveBeenCalled();
    },
    FULL_SEARCH_TEST_TIMEOUT_MS
  );

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

  it("shows errors for engine and fuel when make, model and year are filled in but engine and fuel are missing", async () => {
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await chooseMake(user, "Volkswagen");
    await user.type(labelledControl("Model"), "Golf");
    await user.type(labelledControl("Year"), "2018");
    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(screen.getAllByText(REQUIRED_ERROR_TEXT)).toHaveLength(2);
    expect(hasRequiredError("Engine")).toBe(true);
    expect(hasRequiredError("Fuel")).toBe(true);
    expect(hasRequiredError("Make")).toBe(false);
    expect(hasRequiredError("Model")).toBe(false);
    expect(hasRequiredError("Year")).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows errors for the remaining required fields when only the model is filled in", async () => {
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await user.type(labelledControl("Model"), "Golf");
    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(screen.getAllByText(REQUIRED_ERROR_TEXT)).toHaveLength(4);
    expect(hasRequiredError("Make")).toBe(true);
    expect(hasRequiredError("Year")).toBe(true);
    expect(hasRequiredError("Fuel")).toBe(true);
    expect(hasRequiredError("Engine")).toBe(true);
    expect(hasRequiredError("Model")).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("hides the engine field once electric fuel is selected", async () => {
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    expect(labelledControl("Engine")).toBeInTheDocument();

    await user.selectOptions(labelledControl("Fuel"), "electric");

    expect(queryLabelledControl("Engine")).not.toBeInTheDocument();
  });

  it(
    "navigates to the vehicle detail page with the electric sentinel when fuel is electric and engine is left blank",
    async () => {
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
    },
    FULL_SEARCH_TEST_TIMEOUT_MS
  );

  it("still requires the engine field for a full submit when fuel is not electric", async () => {
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await chooseMake(user, "Volkswagen");
    await user.type(labelledControl("Model"), "Golf");
    await user.type(labelledControl("Year"), "2018");
    await user.selectOptions(labelledControl("Fuel"), "diesel");
    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(screen.getAllByText(REQUIRED_ERROR_TEXT)).toHaveLength(1);
    expect(hasRequiredError("Engine")).toBe(true);
    expect(pushMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("restores the engine field when fuel changes away from electric", async () => {
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await user.type(labelledControl("Engine"), "2.0 TDI");
    await user.selectOptions(labelledControl("Fuel"), "electric");
    await user.selectOptions(labelledControl("Fuel"), "diesel");

    expect(labelledControl("Engine")).toHaveValue("2.0 TDI");
  });

  it("shows errors for the remaining required fields when only a make is selected from the dropdown", async () => {
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    const makeInput = labelledControl("Make");
    await user.click(makeInput);
    await user.paste("Volks");
    await user.click(await screen.findByRole("option", { name: "Volkswagen" }));
    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(screen.getAllByText(REQUIRED_ERROR_TEXT)).toHaveLength(4);
    expect(hasRequiredError("Model")).toBe(true);
    expect(hasRequiredError("Year")).toBe(true);
    expect(hasRequiredError("Fuel")).toBe(true);
    expect(hasRequiredError("Engine")).toBe(true);
    expect(hasRequiredError("Make")).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows errors for the remaining required fields when a typed make with no known match is submitted", async () => {
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    const makeInput = labelledControl("Make");
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

    expect(labelledControl("Make")).toHaveValue("Skodaa");
    expect(screen.getAllByText(REQUIRED_ERROR_TEXT)).toHaveLength(4);
    expect(hasRequiredError("Make")).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows errors for the missing model and year fields when make, engine, fuel and doors are filled in", async () => {
    const user = createUser();
    render(<VehicleSearchForm isDatabaseUp={true} />);

    await chooseMake(user, "Volkswagen");
    await user.type(labelledControl("Engine"), "2.0 TDI");
    await user.selectOptions(labelledControl("Fuel"), "diesel");
    await user.selectOptions(labelledControl("Doors (optional)"), "5");
    await user.click(screen.getByRole("button", { name: "Search faults" }));

    expect(screen.getAllByText(REQUIRED_ERROR_TEXT)).toHaveLength(2);
    expect(hasRequiredError("Model")).toBe(true);
    expect(hasRequiredError("Year")).toBe(true);
    expect(pushMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
