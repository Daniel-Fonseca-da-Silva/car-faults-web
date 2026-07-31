import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale } from "@/i18n/locales";
import { resolveTokenExpirySeconds } from "@/lib/api/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/api/constants";

const FALLBACK_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function GET(request: NextRequest): NextResponse {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get("token");
  const locale = searchParams.get("locale") ?? defaultLocale;

  if (!token) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  const response = NextResponse.redirect(new URL(`/${locale}`, request.url));

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: resolveTokenExpirySeconds(token) ?? FALLBACK_MAX_AGE_SECONDS,
  });

  return response;
}

export function DELETE(): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
