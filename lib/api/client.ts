import { getApiBaseUrl } from "@/lib/api/config";

/**
 * For Client Components. Relies on the API's own httpOnly cookie
 * (set cross-site on its callback redirect), sent via `credentials: "include"`.
 */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    credentials: "include",
  });
}
