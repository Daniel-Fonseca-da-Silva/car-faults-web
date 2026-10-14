import { render, screen } from "@testing-library/react";

import { MercadoLivreProducts } from "./mercado-livre-products";

const labels = {
  steeringWheelCover: "Capa de volante",
  lubricantSpray: "WD-40",
  engineOil: "Óleo de motor",
  battery: "Bateria",
  wipers: "Palhetas",
  tools: "Ferramentas",
  headlightBulbs: "Lâmpadas",
};

describe("MercadoLivreProducts", () => {
  it("renders sponsored links for each product", () => {
    render(
      <MercadoLivreProducts
        products={[
          { id: "engineOil", url: "https://meli.la/a" },
          { id: "battery", url: "https://meli.la/b" },
        ]}
        title="Produtos úteis"
        subtitle="Confira ofertas"
        disclosure="Links de afiliado"
        labels={labels}
      />
    );

    expect(screen.getByText("Confira ofertas")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Produtos úteis" })
    ).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Óleo de motor" });
    expect(link).toHaveAttribute("href", "https://meli.la/a");
    expect(link.getAttribute("rel")).toContain("sponsored");
    expect(screen.getByRole("link", { name: "Bateria" })).toHaveAttribute(
      "href",
      "https://meli.la/b"
    );
    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(screen.getByText("Links de afiliado")).toBeInTheDocument();
  });

  it("renders nothing without products", () => {
    const { container } = render(
      <MercadoLivreProducts
        products={[]}
        title="Produtos úteis"
        subtitle="Confira ofertas"
        disclosure="Links de afiliado"
        labels={labels}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
