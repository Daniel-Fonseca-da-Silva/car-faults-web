import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import { COOKIE_CONSENT_NAME } from "@/lib/cookies/consent";

import { CookieConsentModal } from "./cookie-consent-modal";
import { CookieConsentProvider } from "./cookie-consent-provider";

const cookiesDict: Record<string, string> = {
  description:
    "Usamos cookies essenciais para o funcionamento do site. Publicidade e estatísticas só com o seu sim. Recusar não impede usar o site.",
  privacyLink: "Política de Privacidade e cookies",
  accept: "Aceitar",
  reject: "Recusar",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => cookiesDict[key] ?? key,
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function clearConsentCookie() {
  document.cookie = `${COOKIE_CONSENT_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function renderModal() {
  return render(
    <CookieConsentProvider>
      <CookieConsentModal />
    </CookieConsentProvider>
  );
}

describe("CookieConsentModal", () => {
  afterEach(() => {
    clearConsentCookie();
  });

  it("appears after mount when no consent cookie is set", async () => {
    renderModal();

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(cookiesDict.description)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: cookiesDict.privacyLink })
    ).toHaveAttribute("href", "/privacy#privacy");
  });

  it("does not appear when the consent cookie is already accepted", async () => {
    document.cookie = `${COOKIE_CONSENT_NAME}=accepted; path=/;`;
    renderModal();

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  it("does not appear when the consent cookie is already rejected", async () => {
    document.cookie = `${COOKIE_CONSENT_NAME}=rejected; path=/;`;
    renderModal();

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  it("hides and stores an accepted cookie when Accept is clicked", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(
      await screen.findByRole("button", { name: cookiesDict.accept })
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(document.cookie).toContain(`${COOKIE_CONSENT_NAME}=accepted`);
  });

  it("hides and stores a rejected cookie when Reject is clicked", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(
      await screen.findByRole("button", { name: cookiesDict.reject })
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(document.cookie).toContain(`${COOKIE_CONSENT_NAME}=rejected`);
  });
});
