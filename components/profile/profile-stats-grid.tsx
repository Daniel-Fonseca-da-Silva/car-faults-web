import { BookOpen, Heart, type LucideIcon, Search, Star, ThumbsUp } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Card } from "@/components/ui/card";
import type { UserStats } from "@/types/user-stats";

interface ProfileStatsGridProps {
  stats: UserStats;
}

interface StatEntry {
  icon: LucideIcon;
  value: number;
  labelKey: string;
}

export async function ProfileStatsGrid({ stats }: ProfileStatsGridProps) {
  const t = await getTranslations("profile.stats");

  const entries: StatEntry[] = [
    { icon: Search, value: stats.searchesCount, labelKey: "searches" },
    {
      icon: BookOpen,
      value: stats.defectsConsultedCount,
      labelKey: "defectsConsulted",
    },
    { icon: Star, value: stats.savedVehiclesCount, labelKey: "savedVehicles" },
    {
      icon: Heart,
      value: stats.favoritedVehiclesCount,
      labelKey: "favoritedVehicles",
    },
    { icon: ThumbsUp, value: stats.votesCount, labelKey: "votes" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {entries.map(({ icon: Icon, value, labelKey }) => (
        <Card key={labelKey} className="p-5">
          <Icon aria-hidden="true" className="size-5 text-primary" />
          <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t(labelKey)}</p>
        </Card>
      ))}
    </div>
  );
}
