import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import type { UserProfile } from "@/types/user";

import { UserMenu } from "./user-menu";

const pushMock = jest.fn();
const refreshMock = jest.fn();
const logoutMock = jest.fn();

const navDict: Record<string, string> = {
  profile: "Profile",
  logout: "Log out",
  login: "Sign in",
};

const user: UserProfile = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana Silva",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
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
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
    replace: jest.fn(),
  }),
}));

jest.mock("@/lib/auth/logout", () => ({
  logout: () => logoutMock(),
}));

describe("UserMenu", () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    logoutMock.mockClear();
    logoutMock.mockResolvedValue(undefined);
  });

  it("opens a menu with profile and logout options", async () => {
    const testUser = userEvent.setup();
    render(<UserMenu user={user} />);

    await testUser.click(
      screen.getByRole("button", { name: "Account menu for Ana" })
    );

    expect(
      await screen.findByRole("menuitem", { name: "Profile" })
    ).toHaveAttribute("href", "/profile");
    expect(
      screen.getByRole("menuitem", { name: "Log out" })
    ).toBeInTheDocument();
  });

  it("logs out and navigates to login when logout is pressed", async () => {
    const testUser = userEvent.setup();
    render(<UserMenu user={user} />);

    await testUser.click(
      screen.getByRole("button", { name: "Account menu for Ana" })
    );

    const logoutItem = await screen.findByRole("menuitem", {
      name: "Log out",
    });
    await testUser.click(logoutItem);

    expect(logoutMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith("/login");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("renders a sign-in link when there is no user", () => {
    render(<UserMenu user={null} />);

    expect(screen.getByRole("button", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login"
    );
  });
});
