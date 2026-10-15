import type { Locale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";

import { getSiteUrl } from "./get-site-url";

/**
 * Maps a locale-agnostic path (e.g. "/defects/vw/golf") to an absolute
 * URL per locale, keyed by locale code - ready for `alternates.languages`.
 * `x-default` points at the unprefixed path, which the proxy redirects to
 * the visitor's negotiated locale.
 *
 * `onlyLocales` restricts the alternates to locales where the page has
 * content; `x-default` is then dropped, since the negotiated locale could be
 * one without content.
 */
export function buildHreflangLanguages(
  path: string,
  onlyLocales?: readonly Locale[]
): Record<string, string> {
  const siteUrl = getSiteUrl();
  const alternateLocales = onlyLocales
    ? routing.locales.filter((locale) => onlyLocales.includes(locale))
    : routing.locales;
  const isRestricted = alternateLocales.length < routing.locales.length;

  return {
    ...Object.fromEntries(
      alternateLocales.map((locale) => [locale, `${siteUrl}/${locale}${path}`])
    ),
    ...(isRestricted ? {} : { "x-default": `${siteUrl}${path || "/"}` }),
  };
}
