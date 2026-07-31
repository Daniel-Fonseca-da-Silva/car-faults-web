import { render, screen } from "@testing-library/react";

import { LoginFormCard } from "./login-form-card";

const authDict: Record<string, string> = {
  eyebrow: "Access",
  title: "Sign in to your account",
  subtitle: "Welcome back. Access the faults database.",
  google: "Continue with Google",
};

jest.mock("next-intl", () => ({
  useLocale: () => "en-GB",
  useTranslations: () => (key: string) => authDict[key] ?? key,
}));

describe("LoginFormCard", () => {
  it("renders the heading, subtitle and Google button", () => {
    render(<LoginFormCard />);

    expect(
      screen.getByRole("heading", { name: "Sign in to your account" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Welcome back. Access the faults database.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue with Google" })
    ).toBeInTheDocument();
  });
});
