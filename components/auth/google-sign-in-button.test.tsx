import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GoogleSignInButton } from "./google-sign-in-button";

const authDict: Record<string, string> = {
  google: "Continue with Google",
};

jest.mock("next-intl", () => ({
  useLocale: () => "pt-PT",
  useTranslations: () => (key: string) => authDict[key] ?? key,
}));

jest.mock("@/lib/api/config", () => ({
  getApiBaseUrl: () => "https://api.example.com",
}));

describe("GoogleSignInButton", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, href: "" },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("renders the Google label", () => {
    render(<GoogleSignInButton />);

    expect(
      screen.getByRole("button", { name: "Continue with Google" })
    ).toBeInTheDocument();
  });

  it("redirects to the API's Google OAuth endpoint with the current locale as state", async () => {
    const user = userEvent.setup();
    render(<GoogleSignInButton />);

    await user.click(
      screen.getByRole("button", { name: "Continue with Google" })
    );

    expect(window.location.href).toBe(
      "https://api.example.com/v1/auth/google?state=pt-PT"
    );
  });
});
