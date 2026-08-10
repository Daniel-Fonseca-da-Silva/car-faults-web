import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  serializeJsonLd,
} from "./json-ld";

const TEST_SITE_NAME = "Auto Crónica";

describe("serializeJsonLd", () => {
  it("escapes < so a value can't break out of the surrounding script tag", () => {
    const serialized = serializeJsonLd({ text: "</script><script>evil" });

    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script>\\u003cscript>evil");
  });
});

describe("buildBreadcrumbJsonLd", () => {
  it("builds a BreadcrumbList with absolute item URLs and 1-based positions", () => {
    const jsonLd = buildBreadcrumbJsonLd([
      { name: "Home", path: "/pt-PT" },
      { name: "Defects", path: "/pt-PT/defects" },
    ]);

    expect(jsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "http://localhost:3000/pt-PT",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Defects",
          item: "http://localhost:3000/pt-PT/defects",
        },
      ],
    });
  });
});

describe("buildWebsiteJsonLd", () => {
  const originalSiteName = process.env.NEXT_PUBLIC_SITE_NAME;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_NAME = TEST_SITE_NAME;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_NAME = originalSiteName;
  });

  it("builds a WebSite entry for the given locale", () => {
    expect(buildWebsiteJsonLd("en-GB")).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: TEST_SITE_NAME,
      url: "http://localhost:3000/en-GB",
    });
  });
});

describe("buildOrganizationJsonLd", () => {
  const originalSiteName = process.env.NEXT_PUBLIC_SITE_NAME;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_NAME = TEST_SITE_NAME;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_NAME = originalSiteName;
  });

  it("builds an Organization entry pointing at the site root", () => {
    expect(buildOrganizationJsonLd()).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: TEST_SITE_NAME,
      url: "http://localhost:3000",
    });
  });
});
