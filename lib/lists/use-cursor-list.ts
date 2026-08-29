"use client";

import { useCallback, useRef, useState } from "react";

import type { CursorPage } from "@/types/cursor";

interface UseCursorListOptions<T> {
  initialItems: T[];
  initialCursor: string | null;
  fetchMore: (cursor: string) => Promise<CursorPage<T>>;
}

export function useCursorList<T>({
  initialItems,
  initialCursor,
  fetchMore,
}: UseCursorListOptions<T>) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    setHasError(false);

    try {
      const page = await fetchMore(nextCursor);
      setItems((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch {
      setHasError(true);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [fetchMore, nextCursor]);

  return { items, nextCursor, isLoading, hasError, loadMore };
}
