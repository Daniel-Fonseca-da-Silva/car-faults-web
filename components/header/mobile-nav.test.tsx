import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import type { UserProfile } from "@/types/user";

import { MobileNav } from "./mobile-nav";

const pushMock = jest.fn();
const refreshMock = jest.fn();
const logoutMock = jest.fn();

const navDict: Record<string, string> = {
  defects: "Defeitos",
  about: "Sobre",
  menu: "Menu",
  garage: "Garagem",
  favorites: "Favoritos",
  admin: "Admin",
  logout: "Sair",
  login: "Entrar",
};

const user: UserProfile = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana Silva",
  role: "user",
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

  it("links to the garage page when signed in", async () => {
    const testUser = userEvent.setup();
    render(<MobileNav user={user} />);

    await testUser.click(screen.getByRole("button", { name: "Menu" }));

    expect(
      screen.getByRole("button", { name: "Garagem" })
    ).toHaveAttribute("href", "/garage");
  });

  it("links to the favorites page when signed in", async () => {
    const testUser = userEvent.setup();
    render(<MobileNav user={user} />);

    await testUser.click(screen.getByRole("button", { name: "Menu" }));

    expect(
      screen.getByRole("button", { name: "Favoritos" })
    ).toHaveAttribute("href", "/favorites");
  });

  it("does not show an admin link for a regular user", async () => {
    const testUser = userEvent.setup();
    render(<MobileNav user={user} />);

    await testUser.click(screen.getByRole("button", { name: "Menu" }));

    expect(
      screen.queryByRole("button", { name: "Admin" })
    ).not.toBeInTheDocument();
  });

  it("links to the admin page for an admin user", async () => {
    const testUser = userEvent.setup();
    render(<MobileNav user={{ ...user, role: "admin" }} />);

    await testUser.click(screen.getByRole("button", { name: "Menu" }));

    expect(
      screen.getByRole("button", { name: "Admin" })
    ).toHaveAttribute("href", "/admin");
  });

  it("renders the primary navigation links inside the sheet", async () => {
    const testUser = userEvent.setup();
    render(<MobileNav user={user} />);

    await testUser.click(screen.getByRole("button", { name: "Menu" }));

    for (const label of ["Defeitos", "Sobre"]) {
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

  it("shows the sign-in link before the nav links when signed out", async () => {
    const testUser = userEvent.setup();
    render(<MobileNav user={null} />);

    await testUser.click(screen.getByRole("button", { name: "Menu" }));

    const signInLink = screen.getByRole("button", { name: "Entrar" });
    const firstNavLink = screen.getByRole("button", { name: "Defeitos" });

    expect(
      signInLink.compareDocumentPosition(firstNavLink) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("does not show a sign-in link when signed in", async () => {
    const testUser = userEvent.setup();
    render(<MobileNav user={user} />);

    await testUser.click(screen.getByRole("button", { name: "Menu" }));

    expect(
      screen.queryByRole("button", { name: "Entrar" })
    ).not.toBeInTheDocument();
  });
});
