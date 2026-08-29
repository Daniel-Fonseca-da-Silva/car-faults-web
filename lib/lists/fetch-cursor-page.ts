import { apiFetch } from "@/lib/api/client";
import type { CursorPage } from "@/types/cursor";

export async function fetchCursorPage<T>(path: string): Promise<CursorPage<T>> {
  const response = await apiFetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load page: ${response.status}`);
  }

  return (await response.json()) as CursorPage<T>;
}
