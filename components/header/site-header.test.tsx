import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import { SiteHeader } from "./site-header";

const pushMock = jest.fn();
const getCurrentUserMock = jest.fn();

const navDict: Record<string, string> = {
  recalls: "Recalls",
  defects: "Defects",
  compare: "Compare",
  about: "About",
  menu: "Menu",
  profile: "Profile",
  logout: "Log out",
  login: "Sign in",
};

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    if (namespace === "nav") {
      return (key: string, values?: Record<string, unknown>) => {
        if (key === "avatarAlt") return `${values?.name}'s avatar`;
        if (key === "accountMenu") return `Account menu for ${values?.name}`;
        return navDict[key] ?? key;
      };
    }
    return (key: string) => key;
  },
}));

jest.mock("next-intl", () => ({
  useLocale: () => "en-GB",
  useTranslations: (namespace: string) => {
    if (namespace === "nav") {
      return (key: string, values?: Record<string, unknown>) => {
        if (key === "avatarAlt") return `${values?.name}'s avatar`;
        if (key === "accountMenu") return `Account menu for ${values?.name}`;
        return navDict[key] ?? key;
      };
    }
    if (namespace === "common") {
      return (key: string) => (key === "language" ? "Language" : key);
    }
    return (key: string) => key;
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
  usePathname: () => "/",
  useRouter: () => ({ replace: jest.fn(), push: pushMock }),
}));

jest.mock("@/lib/api/users", () => ({
  getCurrentUser: () => getCurrentUserMock(),
}));

describe("SiteHeader", () => {
  beforeEach(() => {
    pushMock.mockClear();
    getCurrentUserMock.mockReset();
    getCurrentUserMock.mockResolvedValue({
      id: "u1",
      email: "ana@example.com",
      name: "Ana Silva",
      role: "user",
      avatarUrl: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("renders the primary navigation links", async () => {
    const jsx = await SiteHeader();
    render(jsx);

    for (const label of ["Recalls", "Defects", "Compare", "About"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it("renders the brand logo linking to the homepage", async () => {
    const jsx = await SiteHeader();
    render(jsx);

    const homeLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/");
    expect(homeLinks.length).toBeGreaterThan(0);
    expect(homeLinks[0]).toHaveTextContent("CARFAULTS");
  });

  it("opens the account menu with a profile link when signed in", async () => {
    const user = userEvent.setup();
    const jsx = await SiteHeader();
    render(jsx);

    await user.click(
      screen.getByRole("button", { name: "Account menu for Ana" })
    );

    expect(
      await screen.findByRole("menuitem", { name: "Profile" })
    ).toHaveAttribute("href", "/profile");
  });

  it("shows a sign-in call to action when signed out", async () => {
    getCurrentUserMock.mockResolvedValue(null);
    const jsx = await SiteHeader();
    render(jsx);

    const signInCtas = screen.getAllByRole("button", { name: "Sign in" });
    expect(signInCtas.length).toBeGreaterThan(0);
    expect(signInCtas[0]).toHaveAttribute("href", "/login");
  });

  it("opens the mobile navigation sheet when the menu button is pressed", async () => {
    const user = userEvent.setup();
    const jsx = await SiteHeader();
    render(jsx);

    expect(screen.getAllByText("Recalls")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Menu" }));

    expect(screen.getAllByText("Recalls")).toHaveLength(2);
  });
});
