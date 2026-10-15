import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/api/constants";
import { getCurrentUser } from "@/lib/api/users";

/**
 * The signed-in user for client components (header menu, vehicle actions),
 * so public pages don't read the session while rendering and can be served
 * from the CDN. Anonymous visitors and crawlers have no session cookie, so
 * they're answered here without calling the API.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = request.cookies.has(SESSION_COOKIE_NAME)
    ? await getCurrentUser()
    : null;

  return NextResponse.json(
    { user },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
