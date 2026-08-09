import { getSiteUrl } from "./get-site-url";
import { SITE_NAME } from "./site-brand";

/** JSON-LD is inlined via dangerouslySetInnerHTML — escape `<` so a value
 * containing "</script>" can't break out of the script tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export interface BreadcrumbJsonLdItem {
  name: string;
  /** Locale-prefixed path, e.g. "/pt-PT/defects". */
  path: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbJsonLdItem[]) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

export function buildWebsiteJsonLd(locale: string) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${siteUrl}/${locale}`,
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: getSiteUrl(),
  };
}
