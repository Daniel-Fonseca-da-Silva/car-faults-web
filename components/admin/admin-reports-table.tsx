"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import { AdminReportStatusActions } from "@/components/admin/admin-report-status-actions";
import { InfiniteScrollSentinel } from "@/components/lists/infinite-scroll-sentinel";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchAdminReportsPage } from "@/lib/admin/fetch-admin-reports-page";
import { ADMIN_REPORTS_PAGE_SIZE } from "@/lib/lists/page-sizes";
import { useCursorList } from "@/lib/lists/use-cursor-list";
import { formatRelativeTime } from "@/lib/utils";
import type { AdminReport, AdminReportStatus } from "@/types/admin";

interface AdminReportsTableProps {
  initialItems: AdminReport[];
  initialCursor: string | null;
  status?: AdminReportStatus;
}

function statusBadgeVariant(
  status: AdminReportStatus
): "secondary" | "outline" | "ghost" {
  switch (status) {
    case "pending":
      return "secondary";
    case "reviewed":
      return "outline";
    case "dismissed":
      return "ghost";
  }
}

export const AdminReportsTable = ({
  initialItems,
  initialCursor,
  status,
}: AdminReportsTableProps) => {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const fetchMore = useCallback(
    (cursor: string) =>
      fetchAdminReportsPage({
        cursor,
        limit: ADMIN_REPORTS_PAGE_SIZE,
        status,
      }),
    [status]
  );

  const { items, nextCursor, isLoading, loadMore } = useCursorList({
    initialItems,
    initialCursor,
    fetchMore,
  });

  const visibleItems = items.filter((item) => !resolvedIds.has(item.id));

  if (visibleItems.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("reports.empty")}</p>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("reports.columnType")}</TableHead>
            <TableHead>{t("reports.columnContent")}</TableHead>
            <TableHead>{t("reports.columnReason")}</TableHead>
            <TableHead>{t("reports.columnDetails")}</TableHead>
            <TableHead>{t("reports.columnStatus")}</TableHead>
            <TableHead>{t("reports.columnReported")}</TableHead>
            <TableHead>{t("reports.columnActions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleItems.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{t(`reports.contentType.${report.contentType}`)}</TableCell>
              <TableCell className="max-w-xs truncate">
                {report.contentPreview ?? t("reports.contentDeleted")}
              </TableCell>
              <TableCell>{t(`reports.reason.${report.reason}`)}</TableCell>
              <TableCell className="max-w-xs truncate">
                {report.details ?? "-"}
              </TableCell>
              <TableCell>
                <Badge variant={statusBadgeVariant(report.status)}>
                  {t(`reports.status.${report.status}`)}
                </Badge>
              </TableCell>
              <TableCell>{formatRelativeTime(report.createdAt, locale)}</TableCell>
              <TableCell>
                <AdminReportStatusActions
                  reportId={report.id}
                  contentExists={report.contentExists}
                  onResolved={(id) =>
                    setResolvedIds((current) => new Set(current).add(id))
                  }
                />
              </TableCell>
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
