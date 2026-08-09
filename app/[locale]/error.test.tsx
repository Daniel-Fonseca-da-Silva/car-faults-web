import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import LocaleError from "./error";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `common.error.${key}`,
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("LocaleError", () => {
  it("renders the title and description", () => {
    render(<LocaleError error={new Error("boom")} reset={jest.fn()} />);

    expect(
      screen.getByRole("heading", { name: "common.error.title" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("common.error.description")
    ).toBeInTheDocument();
  });

  it("calls reset when the try again button is clicked", async () => {
    const reset = jest.fn();
    const user = userEvent.setup();
    render(<LocaleError error={new Error("boom")} reset={reset} />);

    await user.click(
      screen.getByRole("button", { name: "common.error.tryAgain" })
    );

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("links back to the homepage", () => {
    render(<LocaleError error={new Error("boom")} reset={jest.fn()} />);

    const link = screen.getByRole("link", { name: "common.error.backHome" });
    expect(link).toHaveAttribute("href", "/");
  });
});
