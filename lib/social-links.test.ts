import { SOCIAL_LINKS } from "./social-links";

describe("SOCIAL_LINKS", () => {
  it("has an entry for instagram, facebook, youtube and tiktok", () => {
    const ids = SOCIAL_LINKS.map(({ id }) => id);
    expect(ids).toEqual(["instagram", "facebook", "youtube", "tiktok"]);
  });

  it("has a real https href for every entry", () => {
    for (const { href } of SOCIAL_LINKS) {
      expect(href).not.toBe("#");
      expect(href).toMatch(/^https:\/\//);
    }
  });

  it("has a defined icon path for every entry", () => {
    for (const { icon } of SOCIAL_LINKS) {
      expect(icon.path).toEqual(expect.any(String));
      expect(icon.path.length).toBeGreaterThan(0);
    }
  });

  it("has a footer.social labelKey for every entry", () => {
    for (const { labelKey } of SOCIAL_LINKS) {
      expect(labelKey).toMatch(/^footer\.social\./);
    }
  });
});
