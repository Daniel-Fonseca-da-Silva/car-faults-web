import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import { UserMenu } from "./user-menu";

const pushMock = jest.fn();

const navDict: Record<string, string> = {
  profile: "Profile",
  logout: "Log out",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (key === "avatarAlt") return `${values?.name}'s avatar`;
    if (key === "accountMenu") return `Account menu for ${values?.name}`;
    return navDict[key] ?? key;
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
  useRouter: () => ({ push: pushMock, replace: jest.fn() }),
}));

describe("UserMenu", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("opens a menu with profile and logout options", async () => {
    const user = userEvent.setup();
    render(<UserMenu name="Ana Silva" avatarUrl={null} />);

    await user.click(
      screen.getByRole("button", { name: "Account menu for Ana" })
    );

    expect(
      await screen.findByRole("menuitem", { name: "Profile" })
    ).toHaveAttribute("href", "/profile");
    expect(
      screen.getByRole("menuitem", { name: "Log out" })
    ).toBeInTheDocument();
  });

  it("navigates to login when logout is pressed", async () => {
    const user = userEvent.setup();
    render(<UserMenu name="Ana Silva" avatarUrl={null} />);

    await user.click(
      screen.getByRole("button", { name: "Account menu for Ana" })
    );

    const logoutItem = await screen.findByRole("menuitem", { name: "Log out" });
    await user.click(logoutItem);

    expect(pushMock).toHaveBeenCalledWith("/login");
  });
});
