import { getSiteContactEmail, getSiteName } from "./site-brand";

describe("getSiteName", () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_NAME;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_NAME = originalEnv;
  });

  it("returns the configured site name", () => {
    process.env.NEXT_PUBLIC_SITE_NAME = "Auto Crónica";

    expect(getSiteName()).toBe("Auto Crónica");
  });

  it("throws when NEXT_PUBLIC_SITE_NAME is not set", () => {
    delete process.env.NEXT_PUBLIC_SITE_NAME;

    expect(() => getSiteName()).toThrow("NEXT_PUBLIC_SITE_NAME is not set");
  });
});

describe("getSiteContactEmail", () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL = originalEnv;
  });

  it("returns the configured contact email", () => {
    process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL = "contact@autocronica.autos";

    expect(getSiteContactEmail()).toBe("contact@autocronica.autos");
  });

  it("throws when NEXT_PUBLIC_SITE_CONTACT_EMAIL is not set", () => {
    delete process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL;

    expect(() => getSiteContactEmail()).toThrow(
      "NEXT_PUBLIC_SITE_CONTACT_EMAIL is not set"
    );
  });
});
