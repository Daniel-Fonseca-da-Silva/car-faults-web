"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { FavoriteVehicleCard } from "@/components/favorites/favorite-vehicle-card";
import { InfiniteScrollSentinel } from "@/components/lists/infinite-scroll-sentinel";
import { Reveal } from "@/components/motion/reveal";
import { fetchFavoriteVehiclesPage } from "@/lib/favorites/fetch-favorite-vehicles-page";
import { FAVORITES_PAGE_SIZE } from "@/lib/lists/page-sizes";
import { useCursorList } from "@/lib/lists/use-cursor-list";
import type { FavoriteVehicle } from "@/types/favorite-vehicle";

/** Matches the `lg` column count: the first row cascades in and loads eagerly. */
const GRID_COLUMNS = 3;
const CARD_DELAY_STEP = 0.08;

interface FavoritesGridProps {
  initialItems: FavoriteVehicle[];
  initialCursor: string | null;
}

export const FavoritesGrid = ({
  initialItems,
  initialCursor,
}: FavoritesGridProps) => {
  const t = useTranslations("favorites");
  const tCommon = useTranslations("common");

  const fetchMore = useCallback(
    (cursor: string) =>
      fetchFavoriteVehiclesPage({ cursor, limit: FAVORITES_PAGE_SIZE }),
    []
  );

  const { items, nextCursor, isLoading, loadMore } = useCursorList({
    initialItems,
    initialCursor,
    fetchMore,
  });

  if (items.length === 0) {
    return (
      <p className="mt-8 text-muted-foreground">{t("empty")}</p>
    );
  }

  return (
    <div className="mt-8">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((vehicle, index) => (
          <li key={`${vehicle.vehicleModelId}-${vehicle.year}`}>
            <Reveal
              className="h-full"
              delay={(index % GRID_COLUMNS) * CARD_DELAY_STEP}
              hoverLift
            >
              <FavoriteVehicleCard
                vehicle={vehicle}
                eager={index < GRID_COLUMNS}
              />
            </Reveal>
          </li>
        ))}
      </ul>
      <InfiniteScrollSentinel
        hasMore={nextCursor !== null}
        isLoading={isLoading}
        onIntersect={loadMore}
        loadingLabel={tCommon("loadingMore")}
      />
    </div>
  );
};
