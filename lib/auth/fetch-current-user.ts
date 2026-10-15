import type { UserProfile } from "@/types/user";

/** For Client Components; null when signed out or the check fails. */
export async function fetchCurrentUser(): Promise<UserProfile | null> {
  try {
    const response = await fetch("/api/auth/me", { cache: "no-store" });

    if (!response.ok) {
      return null;
    }

    const { user } = (await response.json()) as { user: UserProfile | null };
    return user;
  } catch {
    return null;
  }
}
