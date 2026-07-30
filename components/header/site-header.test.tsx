import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import { SiteHeader } from "./site-header";

const pushMock = jest.fn();

const navDict: Record<string, string> = {
  recalls: "Recalls",
  defects: "Defects",
  compare: "Compare",
  about: "About",
  menu: "Menu",
  profile: "Profile",
  logout: "Log out",
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

describe("SiteHeader", () => {
  beforeEach(() => {
    pushMock.mockClear();
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

  it("opens the account menu with a profile link", async () => {
    const user = userEvent.setup();
    const jsx = await SiteHeader();
    render(jsx);

    await user.click(
      screen.getByRole("button", { name: "Account menu for Ana" })
    );

    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile"
    );
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
