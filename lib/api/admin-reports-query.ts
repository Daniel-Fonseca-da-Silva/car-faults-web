import { appendCursorParams, toSearchString } from "@/lib/api/cursor";
import type { AdminReportStatus } from "@/types/admin";
import type { CursorQuery } from "@/types/cursor";

export interface AdminReportsQuery extends CursorQuery {
  status?: AdminReportStatus;
}

export function buildAdminReportsQuery(query: AdminReportsQuery): string {
  const params = new URLSearchParams();
  appendCursorParams(params, query);
  if (query.status) params.set("status", query.status);
  return toSearchString(params);
}
