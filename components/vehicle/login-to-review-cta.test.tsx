import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { LoginToReviewCta } from "./login-to-review-cta";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const dict: Record<string, string> = {
      "vehicle.reviews.loginToReview": "Inicia sessão para avaliar.",
      "vehicle.reviews.loginCta": "Entrar",
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

describe("LoginToReviewCta", () => {
  it("renders the login message and a link to the login page", () => {
    render(<LoginToReviewCta />);

    expect(screen.getByText("Inicia sessão para avaliar.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/login"
    );
  });
});
