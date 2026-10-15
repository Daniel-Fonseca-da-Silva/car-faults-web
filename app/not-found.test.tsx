import { render, screen } from "@testing-library/react";

import RootNotFound from "./not-found";

// The root boundary renders outside the [locale] segment: next-intl's request
// APIs would read the request headers there and make every page dynamic.
jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn(),
  getLocale: jest.fn(),
}));

describe("RootNotFound", () => {
  it("renders the default locale's 404", () => {
    render(<RootNotFound />);

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
