import { cookies } from "next/headers";

import { getApiBaseUrl } from "@/lib/api/config";
import { SESSION_COOKIE_NAME } from "@/lib/api/constants";

/**
 * For Server Components / Route Handlers. The web app's own httpOnly cookie
 * (set by app/api/auth/session) is sent as a Bearer token, since the
 * server has no access to the browser's cookies for the API's domain.
 */
export async function serverApiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}
