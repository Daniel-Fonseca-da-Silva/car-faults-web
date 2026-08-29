"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { FaultCardGrid } from "@/components/faults/fault-card-grid";
import { InfiniteScrollSentinel } from "@/components/lists/infinite-scroll-sentinel";
import type { PlatformFaultsQuery } from "@/lib/api/platform-query";
import { fetchPlatformFaultsPage } from "@/lib/faults/fetch-platform-faults-page";
import { DEFECTS_HUB_PAGE_SIZE } from "@/lib/lists/page-sizes";
import { useCursorList } from "@/lib/lists/use-cursor-list";
import type { TopFaultEntry } from "@/types/vehicle";

interface FaultsInfiniteListProps {
  initialItems: TopFaultEntry[];
  initialCursor: string | null;
  query: Omit<PlatformFaultsQuery, "cursor" | "limit">;
}

export const FaultsInfiniteList = ({
  initialItems,
  initialCursor,
  query,
}: FaultsInfiniteListProps) => {
  const t = useTranslations("faults.hub");
  const tCommon = useTranslations("common");

  const fetchMore = useCallback(
    (cursor: string) =>
      fetchPlatformFaultsPage({
        ...query,
        cursor,
        limit: DEFECTS_HUB_PAGE_SIZE,
      }),
    [query]
  );

  const { items, nextCursor, isLoading, loadMore } = useCursorList({
    initialItems,
    initialCursor,
    fetchMore,
  });

  if (items.length === 0) {
    return <p className="text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <div>
      <FaultCardGrid entries={items} />
      <InfiniteScrollSentinel
        hasMore={nextCursor !== null}
        isLoading={isLoading}
        onIntersect={loadMore}
        loadingLabel={tCommon("loadingMore")}
      />
    </div>
  );
};
