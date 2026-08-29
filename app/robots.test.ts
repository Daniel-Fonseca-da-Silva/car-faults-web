import robots from "./robots";

const DISALLOW = [
  "/api/",
  "/*/login",
  "/*/auth/",
  "/*/profile",
  "/*/garage",
  "/*/favorites",
  "/*/admin",
];

describe("robots", () => {
  it("allows crawling for the default and every named crawler user agent, and points to the sitemap", () => {
    const result = robots();

    expect(result.rules).toEqual([
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: "Googlebot", allow: "/", disallow: DISALLOW },
      { userAgent: "Bingbot", allow: "/", disallow: DISALLOW },
      { userAgent: "DuckDuckBot", allow: "/", disallow: DISALLOW },
      { userAgent: "Yandex", allow: "/", disallow: DISALLOW },
    ]);
    expect(result.sitemap).toBe("http://localhost:3000/sitemap.xml");
  });
});
