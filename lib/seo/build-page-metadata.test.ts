import { locales } from "@/i18n/locales";

import { buildPageMetadata } from "./build-page-metadata";

const TEST_SITE_NAME = "Auto Crónica";

describe("buildPageMetadata", () => {
  const originalSiteName = process.env.NEXT_PUBLIC_SITE_NAME;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_NAME = TEST_SITE_NAME;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_NAME = originalSiteName;
  });

  it("builds metadata with a plain string title by default", () => {
    const metadata = buildPageMetadata({
      title: "Defects hub",
      description: "Browse known defects.",
      path: "/defects",
      locale: "pt-PT",
    });

    expect(metadata.title).toBe("Defects hub");
    expect(metadata.description).toBe("Browse known defects.");
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/pt-PT/defects"
    );
    expect(metadata.alternates?.languages).toEqual({
      ...Object.fromEntries(
        locales.map((locale) => [
          locale,
          `http://localhost:3000/${locale}/defects`,
        ])
      ),
      "x-default": "http://localhost:3000/defects",
    });
    expect(metadata.openGraph).toMatchObject({
      title: "Defects hub",
      description: "Browse known defects.",
      url: "http://localhost:3000/pt-PT/defects",
      siteName: TEST_SITE_NAME,
      locale: "pt_PT",
      type: "website",
    });
    expect(metadata.twitter).toEqual({
      card: "summary_large_image",
      title: "Defects hub",
      description: "Browse known defects.",
      images: ["/feature-graphic.png"],
    });
    expect(metadata.robots).toBeUndefined();
  });

  it("wraps the title as absolute when titleIsAbsolute is set", () => {
    const metadata = buildPageMetadata({
      title: "Auto Crónica",
      description: "Home page.",
      path: "",
      locale: "en-GB",
      titleIsAbsolute: true,
    });

    expect(metadata.title).toEqual({ absolute: "Auto Crónica" });
  });

  it("marks the page as noindex/nofollow when noIndex is set", () => {
    const metadata = buildPageMetadata({
      title: "Login",
      description: "Sign in.",
      path: "/login",
      locale: "es-ES",
      noIndex: true,
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("marks the page as noindex but followed when noIndexFollow is set", () => {
    const metadata = buildPageMetadata({
      title: "Golf",
      description: "No known issues yet.",
      path: "/defects/volkswagen/golf",
      locale: "de-DE",
      noIndexFollow: true,
    });

    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it("keeps the canonical on the current locale when it is not among the alternates", () => {
    const metadata = buildPageMetadata({
      title: "Golf",
      description: "Golf issues.",
      path: "/defects/volkswagen/golf",
      locale: "de-DE",
      alternateLocales: ["pt-PT"],
    });

    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/de-DE/defects/volkswagen/golf"
    );
    expect(metadata.alternates?.languages).toEqual({
      "pt-PT": "http://localhost:3000/pt-PT/defects/volkswagen/golf",
    });
  });
});
