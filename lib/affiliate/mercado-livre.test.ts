import { getMercadoLivreProducts } from "./mercado-livre";

describe("getMercadoLivreProducts", () => {
  it("returns the generated affiliate links for pt-BR", () => {
    const products = getMercadoLivreProducts("pt-BR");

    expect(products.map((product) => product.id)).toEqual([
      "steeringWheelCover",
      "lubricantSpray",
      "engineOil",
      "battery",
      "wipers",
      "tools",
      "headlightBulbs",
    ]);
    for (const product of products) {
      expect(product.url).toMatch(/^https:\/\/meli\.la\//);
    }
  });

  it.each(["pt-PT", "es-ES", "es-MX", "en-US", "xx"])(
    "returns no products for %s",
    (locale) => {
      expect(getMercadoLivreProducts(locale)).toEqual([]);
    }
  );
});
