import { apiFetch } from "@/lib/api/client";

export async function deleteCurrentUserAccount(): Promise<void> {
  const response = await apiFetch("/v1/users/me", { method: "DELETE" });

  if (!response.ok) {
    throw new Error(`Failed to delete current user account: ${response.status}`);
  }
}
