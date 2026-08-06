import { apiFetch } from "@/lib/api/client";
import { serverApiFetch } from "@/lib/api/server-client";
import type { AdminKnownIssue, AdminKnownIssueDetail } from "@/types/admin";
import type { IssueSeverity } from "@/types/lookup";

export async function getAdminKnownIssue(
  id: string
): Promise<AdminKnownIssueDetail | null> {
  const response = await serverApiFetch(`/v1/admin/known-issues/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load known issue: ${response.status}`);
  }

  return (await response.json()) as AdminKnownIssueDetail;
}

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
  input: AdminKnownIssueInput
): Promise<AdminKnownIssue> {
  const response = await apiFetch("/v1/admin/known-issues", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to create known issue: ${response.status}`);
  }

  return (await response.json()) as AdminKnownIssue;
}

export async function updateAdminKnownIssue(
  id: string,
  input: Partial<Omit<AdminKnownIssueInput, "vehicleModelId">>
): Promise<AdminKnownIssue> {
  const response = await apiFetch(`/v1/admin/known-issues/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to update known issue: ${response.status}`);
  }

  return (await response.json()) as AdminKnownIssue;
}

export async function deleteAdminKnownIssue(id: string): Promise<void> {
  const response = await apiFetch(`/v1/admin/known-issues/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete known issue: ${response.status}`);
  }
}
