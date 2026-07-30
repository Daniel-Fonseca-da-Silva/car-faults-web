import { ProfileDangerZone } from "@/components/profile/profile-danger-zone";
import { ProfileSavedVehicles } from "@/components/profile/profile-saved-vehicles";
import { ProfileStatsGrid } from "@/components/profile/profile-stats-grid";
import type { UserStats } from "@/types/user-stats";
import type { UserVehicle } from "@/types/user-vehicle";

interface ProfileDashboardProps {
  stats: UserStats;
  vehicles: UserVehicle[];
}

export function ProfileDashboard({ stats, vehicles }: ProfileDashboardProps) {
  return (
    <div className="flex flex-col gap-6">
      <ProfileStatsGrid stats={stats} />
      <ProfileSavedVehicles vehicles={vehicles} />
      <ProfileDangerZone />
    </div>
  );
}
