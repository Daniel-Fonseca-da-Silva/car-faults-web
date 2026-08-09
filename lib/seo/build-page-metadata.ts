import type { Metadata } from "next";

import type { Locale } from "@/i18n/locales";

import { buildHreflangLanguages } from "./build-hreflang";
import { getSiteUrl } from "./get-site-url";
import { SITE_NAME } from "./site-brand";

export interface BuildPageMetadataParams {
  title: string;
  description: string;
  /** Locale-agnostic path, e.g. "/defects/vw/golf" (empty string for home). */
  path: string;
  locale: Locale;
  /** Marks the page as private: excluded from indexing (login, garage, admin, ...). */
  noIndex?: boolean;
  /** Set when `title` already contains the site name, to skip the root layout's "%s | Auto Crónica" template. */
  titleIsAbsolute?: boolean;
}

export function buildPageMetadata({
  title,
  description,
  path,
  locale,
  noIndex,
  titleIsAbsolute,
}: BuildPageMetadataParams): Metadata {
  const languages = buildHreflangLanguages(path);
  const canonical = languages[locale] ?? `${getSiteUrl()}/${locale}${path}`;

  return {
    title: titleIsAbsolute ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
