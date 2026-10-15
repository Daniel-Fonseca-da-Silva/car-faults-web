"use server";

import { updateTag } from "next/cache";

import { PUBLIC_CATALOG_TAG } from "@/lib/api/public-client";
import { serverApiFetch } from "@/lib/api/server-client";
import type { AdminFix } from "@/types/admin";

export interface AdminFixInput {
  knownIssueId: string;
  summary: string;
  steps: string;
}

export async function createAdminFix(
  input: AdminFixInput
): Promise<AdminFix> {
  const response = await serverApiFetch("/v1/admin/fixes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to create fix: ${response.status}`);
  }

  updateTag(PUBLIC_CATALOG_TAG);

  return (await response.json()) as AdminFix;
}

export async function updateAdminFix(
  id: string,
  input: Partial<Omit<AdminFixInput, "knownIssueId">>
): Promise<AdminFix> {
  const response = await serverApiFetch(`/v1/admin/fixes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to update fix: ${response.status}`);
  }

  updateTag(PUBLIC_CATALOG_TAG);

  return (await response.json()) as AdminFix;
}

export async function deleteAdminFix(id: string): Promise<void> {
  const response = await serverApiFetch(`/v1/admin/fixes/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete fix: ${response.status}`);
  }

  updateTag(PUBLIC_CATALOG_TAG);
}
