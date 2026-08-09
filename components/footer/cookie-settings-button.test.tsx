import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CookieSettingsButton } from "./cookie-settings-button";

const openPreferences = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `common.cookies.${key}`,
}));

jest.mock("@/components/cookies/cookie-consent-provider", () => ({
  useCookieConsent: () => ({ openPreferences }),
}));

describe("CookieSettingsButton", () => {
  afterEach(() => {
    openPreferences.mockReset();
  });

  it("renders the manage cookies label", () => {
    render(<CookieSettingsButton />);

    expect(
      screen.getByRole("button", { name: "common.cookies.manage" })
    ).toBeInTheDocument();
  });

  it("calls openPreferences when clicked", async () => {
    const user = userEvent.setup();
    render(<CookieSettingsButton />);

    await user.click(screen.getByRole("button"));

    expect(openPreferences).toHaveBeenCalledTimes(1);
  });
});
