import { buildAmazonSearchUrl, getAmazonStore } from "./amazon";

describe("getAmazonStore", () => {
  it.each(["es-ES", "pt-PT"])("returns Amazon.es for %s", (locale) => {
    expect(getAmazonStore(locale)).toEqual({
      domain: "www.amazon.es",
      tag: "autocronica17-21",
    });
  });

  it.each([
    ["en-GB", "www.amazon.co.uk", "autocronicagb-21"],
    ["de-DE", "www.amazon.de", "autocronicade-21"],
    ["fr-FR", "www.amazon.fr", "autocronicafr-21"],
    ["it-IT", "www.amazon.it", "autocronicait-21"],
  ])("returns the %s store", (locale, domain, tag) => {
    expect(getAmazonStore(locale)).toEqual({ domain, tag });
  });

  it.each(["pt-BR", "en-US", "es-MX", "xx"])(
    "returns null for %s",
    (locale) => {
      expect(getAmazonStore(locale)).toBeNull();
    }
  );
});

describe("buildAmazonSearchUrl", () => {
  it("builds an encoded search URL with the affiliate tag", () => {
    const store = getAmazonStore("es-ES")!;

    expect(buildAmazonSearchUrl(store, "  SEAT León bomba de água ")).toBe(
      "https://www.amazon.es/s?k=SEAT+Le%C3%B3n+bomba+de+%C3%A1gua&tag=autocronica17-21"
    );
  });
});
