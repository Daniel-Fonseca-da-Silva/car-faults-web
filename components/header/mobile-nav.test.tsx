import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import { MobileNav } from "./mobile-nav";

const pushMock = jest.fn();

const navDict: Record<string, string> = {
  recalls: "Recalls",
  defects: "Defeitos",
  compare: "Comparar",
  about: "Sobre",
  menu: "Menu",
  logout: "Sair",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => navDict[key] ?? key,
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
  useRouter: () => ({ push: pushMock, replace: jest.fn() }),
}));

describe("MobileNav", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("links the avatar row to the profile page", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole("button", { name: "Menu" }));

    const profileLink = screen.getByRole("button", { name: /Ana/i });
    expect(profileLink).toHaveAttribute("href", "/profile");
  });

  it("renders the primary navigation links inside the sheet", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole("button", { name: "Menu" }));

    for (const label of ["Recalls", "Defeitos", "Comparar", "Sobre"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("navigates to login when logout is pressed", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(pushMock).toHaveBeenCalledWith("/login");
  });
});
