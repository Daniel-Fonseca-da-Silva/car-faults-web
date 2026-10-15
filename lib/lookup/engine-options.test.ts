import { ENGINE_OPTIONS } from "./engine-options";

describe("ENGINE_OPTIONS", () => {
  it("lists every displacement from 0.6 to 8.0 litres in 0.1 steps", () => {
    expect(ENGINE_OPTIONS[0]).toBe("0.6");
    expect(ENGINE_OPTIONS.at(-1)).toBe("8.0");
    expect(ENGINE_OPTIONS).toHaveLength(75);
    expect(ENGINE_OPTIONS).toEqual(
      expect.arrayContaining(["1.0", "1.6", "2.0", "6.7"])
    );
  });
});
