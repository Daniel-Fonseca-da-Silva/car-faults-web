"use client";

import { Flame } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { GarageRemoveVehicleButton } from "@/components/garage/garage-remove-vehicle-button";
import { InfiniteScrollSentinel } from "@/components/lists/infinite-scroll-sentinel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { fetchGarageVehiclesPage } from "@/lib/garage/fetch-garage-vehicles-page";
import { useCursorList } from "@/lib/lists/use-cursor-list";
import { GARAGE_PAGE_SIZE } from "@/lib/lists/page-sizes";
import type { LookupLanguage } from "@/lib/lookup/map-lookup-language";
import { cn } from "@/lib/utils";
import type { UserVehicle } from "@/types/user-vehicle";

interface GarageVehicleListProps {
  vehicles: UserVehicle[];
  nextCursor: string | null;
  selectedVehicleId: string | null;
  locale: string;
  language: LookupLanguage;
}

export function GarageVehicleList({
  vehicles: initialVehicles,
  nextCursor: initialCursor,
  selectedVehicleId,
  locale,
  language,
}: GarageVehicleListProps) {
  const t = useTranslations("garage.list");
  const tCommon = useTranslations("common");

  const fetchMore = useCallback(
    (cursor: string) =>
      fetchGarageVehiclesPage({
        language,
        cursor,
        limit: GARAGE_PAGE_SIZE,
      }),
    [language]
  );

  const { items, nextCursor, isLoading, loadMore } = useCursorList({
    initialItems: initialVehicles,
    initialCursor,
    fetchMore,
  });

  return (
    <Card className="p-5">
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">
        {t("title")}
      </p>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((vehicle) => {
            const isSelected = vehicle.id === selectedVehicleId;
            const label = `${vehicle.brand} ${vehicle.model}`;

            return (
              <li key={vehicle.id}>
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
                    isSelected
                      ? "border-primary/60 bg-primary/5"
                      : "border-border hover:bg-muted/40"
                  )}
                >
                  <Link
                    href={{
                      pathname: "/garage",
                      query: { vehicleId: vehicle.id },
                    }}
                    className="min-w-0 flex-1"
                  >
                    <span className="block truncate font-semibold text-foreground">
                      {label}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {vehicle.year}
                    </span>
                  </Link>
                  {vehicle.knownIssuesCount > 0 && (
                    <Badge
                      variant="outline"
                      className="shrink-0 gap-1 border-primary/40 text-primary"
                    >
                      <Flame aria-hidden="true" className="size-3" />
                      {t("knownIssuesCount", {
                        count: vehicle.knownIssuesCount,
                      })}
                    </Badge>
                  )}
                  <GarageRemoveVehicleButton
                    locale={locale}
                    vehicleId={vehicle.id}
                    vehicleLabel={label}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <InfiniteScrollSentinel
        hasMore={nextCursor !== null}
        isLoading={isLoading}
        onIntersect={loadMore}
        loadingLabel={tCommon("loadingMore")}
      />
    </Card>
  );
}
