import robots from "./robots";

describe("robots", () => {
  it("allows crawling of the whole site and points to the sitemap", () => {
    const result = robots();

    expect(result.rules).toEqual({ userAgent: "*", allow: "/" });
    expect(result.sitemap).toBe("http://localhost:3000/sitemap.xml");
  });
});
