import { getApiBaseUrl } from "@/lib/api/config";

/** Cache tag for public catalog data (vehicles, known issues, stats). */
export const PUBLIC_CATALOG_TAG = "public-catalog";

/** Public catalog responses are reused for this long before being refetched. */
export const PUBLIC_CATALOG_REVALIDATE_SECONDS = 3 * 60 * 60;

/**
 * For public, user-independent endpoints. Sends no session, so the response
 * is the same for every visitor and can be kept in Next's data cache. Admin
 * mutations invalidate it through PUBLIC_CATALOG_TAG.
 */
export function publicApiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    next: {
      revalidate: PUBLIC_CATALOG_REVALIDATE_SECONDS,
      tags: [PUBLIC_CATALOG_TAG],
    },
  });
}
