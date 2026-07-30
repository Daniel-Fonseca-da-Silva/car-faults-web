import { profileStats, profileUser, profileVehicles } from "@/lib/mocks/profile";
import type { UserProfile } from "@/types/user";
import type { UserStats } from "@/types/user-stats";
import type { UserVehicle } from "@/types/user-vehicle";

export interface ProfilePageData {
  user: UserProfile;
  stats: UserStats;
  vehicles: UserVehicle[];
}

export function getProfilePageData(): ProfilePageData {
  return {
    user: profileUser,
    stats: profileStats,
    vehicles: profileVehicles,
  };
}
