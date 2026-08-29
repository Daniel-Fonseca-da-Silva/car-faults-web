import { appendCursorParams, toSearchString } from "./cursor";

describe("appendCursorParams", () => {
  it("sets limit and cursor when provided", () => {
    const params = new URLSearchParams();
    appendCursorParams(params, { limit: 9, cursor: "abc" });
    expect(params.get("limit")).toBe("9");
    expect(params.get("cursor")).toBe("abc");
  });

  it("omits missing values", () => {
    const params = new URLSearchParams();
    appendCursorParams(params, {});
    expect(params.toString()).toBe("");
  });
});

describe("toSearchString", () => {
  it("prefixes a question mark when params exist", () => {
    expect(toSearchString(new URLSearchParams({ a: "1" }))).toBe("?a=1");
  });

  it("returns an empty string when there are no params", () => {
    expect(toSearchString(new URLSearchParams())).toBe("");
  });
});
