import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import { SiteFooter } from "./site-footer";

const openPreferences = jest.fn();

const footerDict: Record<string, string> = {
  disclaimer:
    "Dados obtidos de relatos públicos, fóruns ou pelo uso de agentes e IA.",
  "social.instagram": "Auto Crónica no Instagram",
  "social.facebook": "Auto Crónica no Facebook",
  "social.youtube": "Auto Crónica no YouTube",
  "social.tiktok": "Auto Crónica no TikTok",
  "legal.privacy": "Privacidade",
  "legal.terms": "Termos",
};

jest.mock("next-intl/server", () => ({
  getTranslations: async () => {
    return (key: string, values?: Record<string, unknown>) => {
      if (key === "footer.copyright") return `© ${values?.year}`;
      if (key === "footer.disclaimer") return footerDict.disclaimer;
      if (key.startsWith("footer.social.") || key.startsWith("footer.legal.")) {
        return footerDict[key.replace("footer.", "")];
      }
      return key;
    };
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

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `common.cookies.${key}`,
}));

jest.mock("@/components/cookies/cookie-consent-provider", () => ({
  useCookieConsent: () => ({ openPreferences }),
}));

jest.mock("@/components/footer/social-links", () => ({
  SocialLinks: () => <div data-testid="social-links" />,
}));

function textContentMatcher(text: string) {
  return (_content: string, element: Element | null) => {
    const hasText = (node: Element) => node.textContent === text;
    return (
      hasText(element as Element) &&
      Array.from(element?.children ?? []).every((child) => !hasText(child))
    );
  };
}

describe("SiteFooter", () => {
  afterEach(() => {
    openPreferences.mockReset();
  });

  it("renders the typographic logo", async () => {
    const jsx = await SiteFooter();
    render(jsx);

    expect(screen.getByText(textContentMatcher("AUTOCRÓNICA"))).toBeInTheDocument();
  });

  it("renders the disclaimer", async () => {
    const jsx = await SiteFooter();
    render(jsx);

    expect(screen.getByText(footerDict.disclaimer)).toBeInTheDocument();
  });

  it("renders the copyright with the current year", async () => {
    const jsx = await SiteFooter();
    render(jsx);

    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year}`)).toBeInTheDocument();
  });

  it("mounts the social links section", async () => {
    const jsx = await SiteFooter();
    render(jsx);

    expect(screen.getByTestId("social-links")).toBeInTheDocument();
  });

  it("links to the privacy policy and terms of service sections", async () => {
    const jsx = await SiteFooter();
    render(jsx);

    const privacyLink = screen.getByRole("link", {
      name: footerDict["legal.privacy"],
    });
    expect(privacyLink).toHaveAttribute("href", "/privacy#privacy");

    const termsLink = screen.getByRole("link", {
      name: footerDict["legal.terms"],
    });
    expect(termsLink).toHaveAttribute("href", "/privacy#terms");
  });

  it("opens cookie preferences when the Cookies button is clicked", async () => {
    const user = userEvent.setup();
    const jsx = await SiteFooter();
    render(jsx);

    await user.click(
      screen.getByRole("button", { name: "common.cookies.manage" })
    );

    expect(openPreferences).toHaveBeenCalledTimes(1);
  });
});
