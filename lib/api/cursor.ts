import type { CursorQuery } from "@/types/cursor";

export function appendCursorParams(
  params: URLSearchParams,
  query: CursorQuery
): void {
  if (query.limit != null) {
    params.set("limit", String(query.limit));
  }
  if (query.cursor) {
    params.set("cursor", query.cursor);
  }
}

export function toSearchString(params: URLSearchParams): string {
  const search = params.toString();
  return search ? `?${search}` : "";
}
