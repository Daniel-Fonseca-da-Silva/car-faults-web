"use client";

import { useEffect, useRef } from "react";

interface InfiniteScrollSentinelProps {
  hasMore: boolean;
  isLoading: boolean;
  onIntersect: () => void;
  loadingLabel: string;
}

export const InfiniteScrollSentinel = ({
  hasMore,
  isLoading,
  onIntersect,
  loadingLabel,
}: InfiniteScrollSentinelProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) {
      return;
    }

    const node = sentinelRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoading) {
          onIntersect();
        }
      },
      { rootMargin: "160px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onIntersect]);

  if (!hasMore) {
    return null;
  }

  return (
    <div ref={sentinelRef} className="flex justify-center py-4">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{loadingLabel}</p>
      ) : (
        <span className="sr-only">{loadingLabel}</span>
      )}
    </div>
  );
};
