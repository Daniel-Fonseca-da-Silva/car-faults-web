import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { SESSION_COOKIE_NAME } from "./lib/api/constants";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PATH_PATTERN = /^\/([^/]+)\/profile(\/|$)/;

export default function proxy(request: NextRequest) {
  const match = PROTECTED_PATH_PATTERN.exec(request.nextUrl.pathname);

  if (match && !request.cookies.get(SESSION_COOKIE_NAME)) {
    const locale = match[1];
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
