"use server";

import { revalidatePath, updateTag } from "next/cache";

import { PUBLIC_CATALOG_TAG } from "@/lib/api/public-client";
import { serverApiFetch } from "@/lib/api/server-client";
import type { AdminKnownIssue } from "@/types/admin";
import type { IssueSeverity } from "@/types/lookup";

export interface AdminKnownIssueInput {
  vehicleModelId: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  locale?: string;
  typicalKm?: number | null;
  sources?: string[] | null;
}

export async function createAdminKnownIssue(
  input: AdminKnownIssueInput,
  { appLocale }: { appLocale: string }
): Promise<AdminKnownIssue> {
  const response = await serverApiFetch("/v1/admin/known-issues", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to create known issue: ${response.status}`);
  }

  updateTag(PUBLIC_CATALOG_TAG);
  revalidatePath(`/${appLocale}/admin/vehicles/${input.vehicleModelId}`);

  return (await response.json()) as AdminKnownIssue;
}

export async function updateAdminKnownIssue(
  id: string,
  input: Partial<Omit<AdminKnownIssueInput, "vehicleModelId">>
): Promise<AdminKnownIssue> {
  const response = await serverApiFetch(`/v1/admin/known-issues/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to update known issue: ${response.status}`);
  }

  updateTag(PUBLIC_CATALOG_TAG);

  return (await response.json()) as AdminKnownIssue;
}

export async function deleteAdminKnownIssue(
  id: string,
  { appLocale, vehicleModelId }: { appLocale: string; vehicleModelId: string }
): Promise<void> {
  const response = await serverApiFetch(`/v1/admin/known-issues/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete known issue: ${response.status}`);
  }

  updateTag(PUBLIC_CATALOG_TAG);
  revalidatePath(`/${appLocale}/admin/vehicles/${vehicleModelId}`);
}
