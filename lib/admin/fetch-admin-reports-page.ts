import {
  buildAdminReportsQuery,
  type AdminReportsQuery,
} from "@/lib/api/admin-reports-query";
import { fetchCursorPage } from "@/lib/lists/fetch-cursor-page";
import type { AdminReport } from "@/types/admin";
import type { CursorPage } from "@/types/cursor";

export async function fetchAdminReportsPage(
  query: AdminReportsQuery
): Promise<CursorPage<AdminReport>> {
  return fetchCursorPage<AdminReport>(
    `/v1/admin/reports${buildAdminReportsQuery(query)}`
  );
}
