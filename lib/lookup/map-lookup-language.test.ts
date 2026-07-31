import { mapLookupLanguage } from "./map-lookup-language";

describe("mapLookupLanguage", () => {
  it("passes pt-PT through unchanged", () => {
    expect(mapLookupLanguage("pt-PT")).toBe("pt-PT");
  });

  it("passes en-GB through unchanged", () => {
    expect(mapLookupLanguage("en-GB")).toBe("en-GB");
  });

  it("passes es-ES through unchanged", () => {
    expect(mapLookupLanguage("es-ES")).toBe("es-ES");
  });

  it("falls back to the default locale for unknown values", () => {
    expect(mapLookupLanguage("fr-FR")).toBe("pt-PT");
  });
});
