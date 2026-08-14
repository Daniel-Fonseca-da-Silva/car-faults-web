"use server";

import { serverApiFetch } from "@/lib/api/server-client";

export async function deleteCurrentUserAccount(): Promise<void> {
  const response = await serverApiFetch("/v1/users/me", { method: "DELETE" });

  if (!response.ok) {
    throw new Error(`Failed to delete current user account: ${response.status}`);
  }
}
