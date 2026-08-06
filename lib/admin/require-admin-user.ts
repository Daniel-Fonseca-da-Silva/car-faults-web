import { getCurrentUser } from "@/lib/api/users";
import type { UserProfile } from "@/types/user";

export async function requireAdminUser(): Promise<UserProfile | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}
