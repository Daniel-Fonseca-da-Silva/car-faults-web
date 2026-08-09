import { buildHreflangLanguages } from "./build-hreflang";

describe("buildHreflangLanguages", () => {
  it("maps every supported locale to an absolute URL for the given path", () => {
    expect(buildHreflangLanguages("/defects/volkswagen/golf")).toEqual({
      "pt-PT": "http://localhost:3000/pt-PT/defects/volkswagen/golf",
      "en-GB": "http://localhost:3000/en-GB/defects/volkswagen/golf",
      "es-ES": "http://localhost:3000/es-ES/defects/volkswagen/golf",
    });
  });

  it("handles an empty path for the home page", () => {
    expect(buildHreflangLanguages("")).toEqual({
      "pt-PT": "http://localhost:3000/pt-PT",
      "en-GB": "http://localhost:3000/en-GB",
      "es-ES": "http://localhost:3000/es-ES",
    });
  });
});
