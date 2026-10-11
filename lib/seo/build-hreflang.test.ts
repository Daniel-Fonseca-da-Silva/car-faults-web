import { locales } from "@/i18n/locales";

import { buildHreflangLanguages } from "./build-hreflang";

describe("buildHreflangLanguages", () => {
  it("maps every supported locale to an absolute URL for the given path", () => {
    expect(buildHreflangLanguages("/defects/volkswagen/golf")).toEqual({
      ...Object.fromEntries(
        locales.map((locale) => [
          locale,
          `http://localhost:3000/${locale}/defects/volkswagen/golf`,
        ])
      ),
      "x-default": "http://localhost:3000/defects/volkswagen/golf",
    });
  });

  it("handles an empty path for the home page", () => {
    expect(buildHreflangLanguages("")).toEqual({
      ...Object.fromEntries(
        locales.map((locale) => [
          locale,
          `http://localhost:3000/${locale}`,
        ])
      ),
      "x-default": "http://localhost:3000/",
    });
  });
});
