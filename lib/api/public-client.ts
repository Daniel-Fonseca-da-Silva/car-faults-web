import { getApiBaseUrl, getInternalApiKey } from "@/lib/api/config";

/** Cache tag for public catalog data (vehicles, known issues, stats). */
export const PUBLIC_CATALOG_TAG = "public-catalog";

/** Must match INTERNAL_API_KEY_HEADER in car-faults-api. */
export const INTERNAL_API_KEY_HEADER = "X-Internal-Api-Key";

/** Public catalog responses are reused for this long before being refetched. */
export const PUBLIC_CATALOG_REVALIDATE_SECONDS = 3 * 60 * 60;

/**
 * For public, user-independent endpoints. Sends no session, so the response
 * is the same for every visitor and can be kept in Next's data cache. Admin
 * mutations invalidate it through PUBLIC_CATALOG_TAG.
 *
 * Carries the internal API key: every visitor's page is fetched from the
 * same few hosting IPs, so the API's per-IP limits would otherwise throttle
 * the whole site. Only these read-only catalog calls send it; user calls
 * (serverApiFetch, the BFF) stay throttled.
 */
export function publicApiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);
  const internalApiKey = getInternalApiKey();
  if (internalApiKey) {
    headers.set(INTERNAL_API_KEY_HEADER, internalApiKey);
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    next: {
      revalidate: PUBLIC_CATALOG_REVALIDATE_SECONDS,
      tags: [PUBLIC_CATALOG_TAG],
    },
  });
}
