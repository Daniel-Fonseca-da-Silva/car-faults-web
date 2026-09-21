/**
 * For Client Components. Browser fetches to the API's origin can't carry
 * the session cookie (it's SameSite and set on the web app's own domain),
 * so this goes through our own /api/bff route, which attaches the Bearer
 * token server-side via `serverApiFetch`.
 */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`/api/bff?path=${encodeURIComponent(path)}`, {
    ...init,
    credentials: "include",
  });
}
