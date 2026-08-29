export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface CursorQuery {
  limit?: number;
  cursor?: string | null;
}
