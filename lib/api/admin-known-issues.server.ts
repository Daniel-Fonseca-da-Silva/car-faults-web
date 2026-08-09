import { serverApiFetch } from "@/lib/api/server-client";
import type { AdminKnownIssueDetail } from "@/types/admin";

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
