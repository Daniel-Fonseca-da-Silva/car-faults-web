"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { InfiniteScrollSentinel } from "@/components/lists/infinite-scroll-sentinel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import { fetchAdminVehiclesPage } from "@/lib/admin/fetch-admin-vehicles-page";
import { ADMIN_VEHICLES_PAGE_SIZE } from "@/lib/lists/page-sizes";
import { useCursorList } from "@/lib/lists/use-cursor-list";
import type { AdminVehicleModel } from "@/types/admin";

interface AdminVehiclesTableProps {
  initialItems: AdminVehicleModel[];
  initialCursor: string | null;
  brand?: string;
  model?: string;
}

function formatYears(vehicle: AdminVehicleModel): string {
  if (vehicle.yearTo && vehicle.yearTo !== vehicle.yearFrom) {
    return `${vehicle.yearFrom}–${vehicle.yearTo}`;
  }
  return String(vehicle.yearFrom);
}

export const AdminVehiclesTable = ({
  initialItems,
  initialCursor,
  brand,
  model,
}: AdminVehiclesTableProps) => {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  const fetchMore = useCallback(
    (cursor: string) =>
      fetchAdminVehiclesPage({
        cursor,
        limit: ADMIN_VEHICLES_PAGE_SIZE,
        brand,
        model,
      }),
    [brand, model]
  );

  const { items, nextCursor, isLoading, loadMore } = useCursorList({
    initialItems,
    initialCursor,
    fetchMore,
  });

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("vehicles.empty")}</p>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("vehicles.columnBrand")}</TableHead>
            <TableHead>{t("vehicles.columnModel")}</TableHead>
            <TableHead>{t("vehicles.columnYears")}</TableHead>
            <TableHead>{t("vehicles.columnEngine")}</TableHead>
            <TableHead>{t("vehicles.columnFuelType")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell>
                <Link
                  href={`/admin/vehicles/${vehicle.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {vehicle.brand}
                </Link>
              </TableCell>
              <TableCell>{vehicle.model}</TableCell>
              <TableCell>{formatYears(vehicle)}</TableCell>
              <TableCell>{vehicle.engine}</TableCell>
              <TableCell>{vehicle.fuelType ?? "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <InfiniteScrollSentinel
        hasMore={nextCursor !== null}
        isLoading={isLoading}
        onIntersect={loadMore}
        loadingLabel={tCommon("loadingMore")}
      />
    </div>
  );
};
