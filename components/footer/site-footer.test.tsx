import { render, screen } from "@testing-library/react";

import { SiteFooter } from "./site-footer";

const footerDict: Record<string, string> = {
  disclaimer:
    "Dados obtidos de relatos públicos e órgãos reguladores. Não substitui avaliação técnica.",
};

jest.mock("next-intl/server", () => ({
  getTranslations: async () => {
    return (key: string, values?: Record<string, unknown>) => {
      if (key === "footer.copyright") return `© ${values?.year}`;
      if (key === "footer.disclaimer") return footerDict.disclaimer;
      return key;
    };
  },
}));

describe("SiteFooter", () => {
  it("renders the typographic logo", async () => {
    const jsx = await SiteFooter();
    render(jsx);

    expect(screen.getByText("CAR")).toBeInTheDocument();
    expect(screen.getByText("FAULTS")).toBeInTheDocument();
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
});
