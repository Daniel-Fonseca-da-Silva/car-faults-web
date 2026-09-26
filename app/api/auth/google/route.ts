import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, locales, type Locale } from "@/i18n/locales";
import { getApiBaseUrl } from "@/lib/api/config";
import {
  OAUTH_STATE_COOKIE_NAME,
  OAUTH_STATE_COOKIE_PATH,
  OAUTH_STATE_MAX_AGE_SECONDS,
} from "@/lib/api/oauth-state";

const NONCE_BYTES = 32;

function resolveLocale(value: string | null): Locale {
  return locales.find((locale) => locale === value) ?? defaultLocale;
}

// Binds the OAuth flow to this browser: the state nonce lives in an httpOnly
// cookie and is checked again in /api/auth/session before the code exchange.
export function GET(request: NextRequest): NextResponse {
  const locale = resolveLocale(request.nextUrl.searchParams.get("locale"));
  const state = `${locale}.${randomBytes(NONCE_BYTES).toString("base64url")}`;

  const response = NextResponse.redirect(
    `${getApiBaseUrl()}/v1/auth/google?state=${encodeURIComponent(state)}`
  );

  response.cookies.set(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: OAUTH_STATE_COOKIE_PATH,
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
  });

  return response;
}
