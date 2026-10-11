import { routing } from "@/i18n/routing";

import { getSiteUrl } from "./get-site-url";

/**
 * Maps a locale-agnostic path (e.g. "/defects/vw/golf") to an absolute
 * URL per locale, keyed by locale code - ready for `alternates.languages`.
 * `x-default` points at the unprefixed path, which the proxy redirects to
 * the visitor's negotiated locale.
 */
export function buildHreflangLanguages(path: string): Record<string, string> {
  const siteUrl = getSiteUrl();

  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [locale, `${siteUrl}/${locale}${path}`])
    ),
    "x-default": `${siteUrl}${path || "/"}`,
  };
}
