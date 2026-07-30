import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoginFormCard } from "./login-form-card";

const authDict: Record<string, string> = {
  eyebrow: "Access",
  title: "Sign in to your account",
  subtitle: "Welcome back. Access the faults database.",
  google: "Continue with Google",
  orSeparator: "or",
  "email.label": "Email",
  "email.placeholder": "you@example.com",
  "password.label": "Password",
  "password.show": "Show password",
  "password.hide": "Hide password",
  forgotPassword: "Forgot my password",
  submit: "Sign in",
  noAccount: "Don't have an account?",
  register: "Sign up for free",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => authDict[key] ?? key,
}));

describe("LoginFormCard", () => {
  it("renders the heading, Google button and form fields", () => {
    render(<LoginFormCard />);

    expect(
      screen.getByRole("heading", { name: "Sign in to your account" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue with Google" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Forgot my password" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Sign up for free" })
    ).toBeInTheDocument();
  });

  it("lets the user type into the email and password fields", async () => {
    const user = userEvent.setup();
    render(<LoginFormCard />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "driver@example.com");
    await user.type(passwordInput, "hunter2");

    expect(emailInput).toHaveValue("driver@example.com");
    expect(passwordInput).toHaveValue("hunter2");
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<LoginFormCard />);

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));

    expect(passwordInput).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Hide password" })
    ).toBeInTheDocument();
  });

  it("stays on the page when the form is submitted (no real submit handler)", async () => {
    const user = userEvent.setup();
    render(<LoginFormCard />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      screen.getByRole("heading", { name: "Sign in to your account" })
    ).toBeInTheDocument();
  });

  it("stays on the page when the Google button is clicked (no real auth flow)", async () => {
    const user = userEvent.setup();
    render(<LoginFormCard />);

    await user.click(screen.getByRole("button", { name: "Continue with Google" }));

    expect(
      screen.getByRole("heading", { name: "Sign in to your account" })
    ).toBeInTheDocument();
  });
});
