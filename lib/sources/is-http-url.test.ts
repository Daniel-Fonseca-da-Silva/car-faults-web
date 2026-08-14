import { isHttpUrl } from "./is-http-url";

describe("isHttpUrl", () => {
  it("returns true for an https url", () => {
    expect(
      isHttpUrl("https://www.auto-doc.pt/info/volkswagen-polo-problemas-associados")
    ).toBe(true);
  });

  it("returns true for an http url", () => {
    expect(isHttpUrl("http://example.com")).toBe(true);
  });

  it("returns true for a url with surrounding whitespace", () => {
    expect(isHttpUrl("  https://example.com  ")).toBe(true);
  });

  it("returns false for prose text", () => {
    expect(isHttpUrl("VW owner forums")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isHttpUrl("")).toBe(false);
  });

  it("returns false for a non-http protocol", () => {
    expect(isHttpUrl("ftp://example.com")).toBe(false);
  });

  it("returns false for a malformed url", () => {
    expect(isHttpUrl("https://")).toBe(false);
  });
});
