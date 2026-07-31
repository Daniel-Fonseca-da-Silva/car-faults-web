import { apiFetch } from "@/lib/api/client";

export async function logout(): Promise<void> {
  await Promise.allSettled([
    apiFetch("/v1/auth/logout", { method: "POST" }),
    fetch("/api/auth/session", { method: "DELETE" }),
  ]);
}
