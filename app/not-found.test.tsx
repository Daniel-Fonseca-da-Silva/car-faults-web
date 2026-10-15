import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import RootNotFound from "./not-found";

jest.mock("@/components/layout/html-document", () => ({
  HtmlDocument: ({ lang, children }: { lang: string; children: ReactNode }) => (
    <div data-testid="html-document" data-lang={lang}>
      {children}
    </div>
  ),
}));

// The root boundary renders outside the [locale] segment: next-intl's request
// APIs would read the request headers there and make every page dynamic.
jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn(),
  getLocale: jest.fn(),
}));

describe("RootNotFound", () => {
  it("renders the default locale's 404 in its own html document", () => {
    render(<RootNotFound />);

    expect(screen.getByTestId("html-document")).toHaveAttribute(
      "data-lang",
      "pt-PT"
    );
    expect(
      screen.getByRole("heading", { name: "Página não encontrada" })
    ).toBeInTheDocument();
  });

  it("links to / so the proxy picks the visitor's locale", () => {
    render(<RootNotFound />);

    expect(
      screen.getByRole("link", { name: "Voltar à página inicial" })
    ).toHaveAttribute("href", "/");
  });

  it("does not use next-intl's request APIs", () => {
    render(<RootNotFound />);

    const { getTranslations, getLocale } = jest.requireMock("next-intl/server");
    expect(getTranslations).not.toHaveBeenCalled();
    expect(getLocale).not.toHaveBeenCalled();
  });
});
