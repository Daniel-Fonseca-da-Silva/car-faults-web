import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { SESSION_COOKIE_NAME } from "./lib/api/constants";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PATH_PATTERN = /^\/([^/]+)\/(profile|garage|admin|favorites)(\/|$)/;
const LOCALE_PREFIX_PATTERN = new RegExp(
  `^/(${routing.locales.join("|")})(/|$)`,
);
// next-intl's default locale cookie name (routing.localeCookie).
const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = PROTECTED_PATH_PATTERN.exec(pathname);

  if (match && !request.cookies.get(SESSION_COOKIE_NAME)) {
    const locale = match[1];
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
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
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
