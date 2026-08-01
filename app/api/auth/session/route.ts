import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale } from "@/i18n/locales";
import { getApiBaseUrl } from "@/lib/api/config";
import { resolveTokenExpirySeconds } from "@/lib/api/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/api/constants";

const FALLBACK_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const locale = searchParams.get("locale") ?? defaultLocale;

  if (!code) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
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
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  const { accessToken } = (await exchangeResponse.json()) as {
    accessToken: string;
  };

  const response = NextResponse.redirect(new URL(`/${locale}`, request.url));

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
