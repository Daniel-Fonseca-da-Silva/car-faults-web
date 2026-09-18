import {
  buildAdminReportsQuery,
  type AdminReportsQuery,
} from "@/lib/api/admin-reports-query";
import { serverApiFetch } from "@/lib/api/server-client";
import type { AdminReport } from "@/types/admin";
import type { CursorPage } from "@/types/cursor";

export type { AdminReportsQuery } from "@/lib/api/admin-reports-query";
export { buildAdminReportsQuery } from "@/lib/api/admin-reports-query";

export async function getAdminReports(
  query: AdminReportsQuery = {}
): Promise<CursorPage<AdminReport>> {
  const response = await serverApiFetch(
    `/v1/admin/reports${buildAdminReportsQuery(query)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to load reports: ${response.status}`);
  }

  return (await response.json()) as CursorPage<AdminReport>;
}
