import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const DISALLOW = [
  "/api/",
  "/*/login",
  "/*/auth/",
  "/*/profile",
  "/*/garage",
  "/*/favorites",
  "/*/admin",
];

const CRAWLER_USER_AGENTS = [
  "Googlebot",
  "Bingbot",
  "DuckDuckBot",
  "Yandex",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...CRAWLER_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
