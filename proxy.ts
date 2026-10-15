import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { SESSION_COOKIE_NAME } from "./lib/api/constants";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PATH_PATTERN = /^\/([^/]+)\/(profile|garage|admin|favorites)(\/|$)/;
const LOCALE_PREFIX_PATTERN = new RegExp(
  `^/(${routing.locales.join("|")})(/|$)`,
);
// /<locale>/defects/<make>/<model>/<year>/<fuelType>/<engine>
const VEHICLE_PAGE_PATTERN = new RegExp(
  `^/(${routing.locales.join("|")})/defects(/[^/]+){5}/?$`,
);
const DOORS_PATTERN = /^\d{1,2}$/;
// next-intl's default locale cookie name (routing.localeCookie).
const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

/**
 * Vehicle links may carry `?doors=N` to pick a body variant. Reading the
 * query string would make the page render on every request, so the variant
 * is rewritten (invisibly, the URL stays the same) to an internal path that
 * is cached like any other page.
 */
function vehicleDoorsRewriteUrl(request: NextRequest): URL | null {
  const { pathname, searchParams } = request.nextUrl;
  const doors = searchParams.get("doors");

  if (
    !doors ||
    !DOORS_PATTERN.test(doors) ||
    !VEHICLE_PAGE_PATTERN.test(pathname)
  ) {
    return null;
  }

  // A plain URL: NextURL would keep the request's trailing slash.
  const url = new URL(request.nextUrl.href);
  url.pathname = `${pathname.replace(/\/$/, "")}/doors/${doors}`;
  url.searchParams.delete("doors");
  return url;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = PROTECTED_PATH_PATTERN.exec(pathname);

  if (match && !request.cookies.get(SESSION_COOKIE_NAME)) {
    const locale = match[1];
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  const doorsRewriteUrl = vehicleDoorsRewriteUrl(request);
  if (doorsRewriteUrl) {
    return NextResponse.rewrite(doorsRewriteUrl);
  }

  // Without a locale prefix in the URL, next-intl would otherwise prefer a
  // stale NEXT_LOCALE cookie over the browser's Accept-Language header,
  // trapping visitors in a previously negotiated/redirected locale.
  if (!LOCALE_PREFIX_PATTERN.test(pathname)) {
    request.cookies.delete(LOCALE_COOKIE_NAME);
  }

  return intlMiddleware(request);
}

export const config = {
  // Skip only real static asset extensions (public/, metadata routes). Other
  // dotted paths (e.g. /wp-admin/install.php from bot scans) must still pass
  // through so next-intl resolves a locale and the localized 404 renders.
  matcher: [
    "/((?!api|_next|_vercel|.*\\.(?:png|jpe?g|webp|gif|svg|ico|txt|xml|html|json|webmanifest|css|js|map|woff2?|mp4|webm)$).*)",
  ],
};
