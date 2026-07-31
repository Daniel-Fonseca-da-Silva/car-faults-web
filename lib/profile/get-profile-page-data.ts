import {
  getCurrentUser,
  getCurrentUserStats,
  getCurrentUserVehicles,
} from "@/lib/api/users";
import type { UserProfile } from "@/types/user";
import type { UserStats } from "@/types/user-stats";
import type { UserVehicle } from "@/types/user-vehicle";

export interface ProfilePageData {
  user: UserProfile;
  stats: UserStats;
  vehicles: UserVehicle[];
}

export async function getProfilePageData(): Promise<ProfilePageData | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const [stats, vehicles] = await Promise.all([
    getCurrentUserStats(),
    getCurrentUserVehicles(),
  ]);

  return { user, stats, vehicles };
}
