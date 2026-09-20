import type { Metadata } from "next";

import type { Locale } from "@/i18n/locales";

import { buildHreflangLanguages } from "./build-hreflang";
import { getSiteUrl } from "./get-site-url";
import { getSiteName } from "./site-brand";

/** Resolved against `metadataBase` (set in the root layout) by Next's Metadata API. */
const OG_IMAGE_PATH = "/feature-graphic.png";
const OG_IMAGE_WIDTH = 1024;
const OG_IMAGE_HEIGHT = 500;

export interface BuildPageMetadataParams {
  title: string;
  description: string;
  /** Locale-agnostic path, e.g. "/defects/vw/golf" (empty string for home). */
  path: string;
  locale: Locale;
  /** Marks the page as private: excluded from indexing (login, garage, admin, ...). */
  noIndex?: boolean;
  /** Set when `title` already contains the site name, to skip the root layout's "%s | {siteName}" template. */
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
      siteName: getSiteName(),
      locale,
      type: "website",
      images: [
        {
          url: OG_IMAGE_PATH,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: getSiteName(),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE_PATH],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
