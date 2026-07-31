import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import type { UserProfile } from "@/types/user";

import { MobileNav } from "./mobile-nav";

const pushMock = jest.fn();
const refreshMock = jest.fn();
const logoutMock = jest.fn();

const navDict: Record<string, string> = {
  recalls: "Recalls",
  defects: "Defeitos",
  compare: "Comparar",
  about: "Sobre",
  menu: "Menu",
  logout: "Sair",
  login: "Entrar",
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
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
    replace: jest.fn(),
  }),
}));

jest.mock("@/lib/auth/logout", () => ({
  logout: () => logoutMock(),
}));

describe("MobileNav", () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    logoutMock.mockClear();
    logoutMock.mockResolvedValue(undefined);
  });

  it("links the avatar row to the profile page", async () => {
    const testUser = userEvent.setup();
    render(<MobileNav user={user} />);

    await testUser.click(screen.getByRole("button", { name: "Menu" }));

    const profileLink = screen.getByRole("button", { name: /Ana/i });
    expect(profileLink).toHaveAttribute("href", "/profile");
  });

  it("renders the primary navigation links inside the sheet", async () => {
    const testUser = userEvent.setup();
    render(<MobileNav user={user} />);

    await testUser.click(screen.getByRole("button", { name: "Menu" }));

    for (const label of ["Recalls", "Defeitos", "Comparar", "Sobre"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("logs out and navigates to login when logout is pressed", async () => {
    const testUser = userEvent.setup();
    render(<MobileNav user={user} />);

    await testUser.click(screen.getByRole("button", { name: "Menu" }));
    await testUser.click(screen.getByRole("button", { name: "Sair" }));

    expect(logoutMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith("/login");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("shows a sign-in link instead of the avatar/logout row when signed out", async () => {
    const testUser = userEvent.setup();
    render(<MobileNav user={null} />);

    await testUser.click(screen.getByRole("button", { name: "Menu" }));

    expect(
      screen.getByRole("button", { name: "Entrar" })
    ).toHaveAttribute("href", "/login");
    expect(
      screen.queryByRole("button", { name: "Sair" })
    ).not.toBeInTheDocument();
  });
});
