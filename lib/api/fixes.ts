"use server";

import { serverApiFetch } from "@/lib/api/server-client";
import type { FixVote, IssueFix } from "@/types/lookup";

export async function voteFix(id: string, value: FixVote): Promise<IssueFix> {
  const response = await serverApiFetch(`/v1/fixes/${id}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });

  if (!response.ok) {
    throw new Error(`Failed to vote on fix: ${response.status}`);
  }

  return (await response.json()) as IssueFix;
}

export async function removeFixVote(id: string): Promise<void> {
  const response = await serverApiFetch(`/v1/fixes/${id}/vote`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to remove fix vote: ${response.status}`);
  }
}
