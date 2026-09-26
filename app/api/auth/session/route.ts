import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, locales, type Locale } from "@/i18n/locales";
import { getApiBaseUrl } from "@/lib/api/config";
import { resolveTokenExpirySeconds } from "@/lib/api/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/api/constants";
import {
  OAUTH_STATE_COOKIE_NAME,
  OAUTH_STATE_COOKIE_PATH,
  oauthStatesMatch,
} from "@/lib/api/oauth-state";

const FALLBACK_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function resolveLocale(value: string | null): Locale {
  return locales.find((locale) => locale === value) ?? defaultLocale;
}

function clearOAuthState(response: NextResponse): NextResponse {
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: OAUTH_STATE_COOKIE_PATH,
    maxAge: 0,
  });
  return response;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const locale = resolveLocale(searchParams.get("locale"));
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value;

  // Login CSRF guard: only the browser that started the flow holds the nonce.
  if (!code || !oauthStatesMatch(expectedState, state)) {
    return clearOAuthState(
      NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    );
  }

  const exchangeResponse = await fetch(
    `${getApiBaseUrl()}/v1/auth/session/exchange`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
      cache: "no-store",
    }
  );

  if (!exchangeResponse.ok) {
    return clearOAuthState(
      NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    );
  }

  const { accessToken } = (await exchangeResponse.json()) as {
    accessToken: string;
  };

  const response = clearOAuthState(
    NextResponse.redirect(new URL(`/${locale}`, request.url))
  );

  response.cookies.set(SESSION_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge:
      resolveTokenExpirySeconds(accessToken) ?? FALLBACK_MAX_AGE_SECONDS,
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
