"use server";

import { revalidatePath } from "next/cache";

import { serverApiFetch } from "@/lib/api/server-client";
import type { AdminReport, AdminReportStatus } from "@/types/admin";

export async function updateAdminReportStatus(
  id: string,
  status: AdminReportStatus,
  { appLocale }: { appLocale: string }
): Promise<AdminReport> {
  const response = await serverApiFetch(`/v1/admin/reports/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update report: ${response.status}`);
  }

  revalidatePath(`/${appLocale}/admin/reports`);

  return (await response.json()) as AdminReport;
}

export async function removeAdminReportContent(
  id: string,
  { appLocale }: { appLocale: string }
): Promise<AdminReport> {
  const response = await serverApiFetch(`/v1/admin/reports/${id}/content`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to remove reported content: ${response.status}`);
  }

  revalidatePath(`/${appLocale}/admin/reports`);

  return (await response.json()) as AdminReport;
}
