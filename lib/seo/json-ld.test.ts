import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  serializeJsonLd,
} from "./json-ld";
import { SITE_NAME } from "./site-brand";

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
  it("builds a WebSite entry for the given locale", () => {
    expect(buildWebsiteJsonLd("en-GB")).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: "http://localhost:3000/en-GB",
    });
  });
});

describe("buildOrganizationJsonLd", () => {
  it("builds an Organization entry pointing at the site root", () => {
    expect(buildOrganizationJsonLd()).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: "http://localhost:3000",
    });
  });
});
