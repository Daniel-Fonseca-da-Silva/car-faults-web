import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { LoginToCommentCta } from "./login-to-comment-cta";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const dict: Record<string, string> = {
      "vehicle.comments.loginToComment": "Inicia sessão para comentar.",
      "vehicle.comments.loginCta": "Entrar",
    };
    return dict[key] ?? key;
  },
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

describe("LoginToCommentCta", () => {
  it("renders the login message and a link to the login page", () => {
    render(<LoginToCommentCta />);

    expect(
      screen.getByText("Inicia sessão para comentar.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/login"
    );
  });
});
