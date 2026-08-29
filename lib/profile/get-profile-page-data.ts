import {
  getCurrentUser,
  getCurrentUserStats,
  getCurrentUserVehicles,
} from "@/lib/api/users";
import { PROFILE_VEHICLES_LIMIT } from "@/lib/lists/page-sizes";
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

  const [stats, vehiclesPage] = await Promise.all([
    getCurrentUserStats(),
    getCurrentUserVehicles({ limit: PROFILE_VEHICLES_LIMIT }),
  ]);

  return { user, stats, vehicles: vehiclesPage.items };
}
