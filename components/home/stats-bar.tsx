import { getLocale, getTranslations } from "next-intl/server";

import { getPlatformStats } from "@/lib/api/platform";
import { formatCompactCount } from "@/lib/utils";

const STAT_KEYS = ["reports", "vehicles", "faults"] as const;
type StatKey = (typeof STAT_KEYS)[number];

export async function StatsBar() {
  const [t, locale, stats] = await Promise.all([
    getTranslations("home.stats"),
    getLocale(),
    getPlatformStats(),
  ]);

  const values: Record<StatKey, number> = {
    reports: stats.reportsCount,
    vehicles: stats.vehiclesCount,
    faults: stats.faultsCount,
  };

  return (
    <section className="mx-auto grid max-w-2xl grid-cols-1 gap-6 py-10 sm:grid-cols-3">
      {STAT_KEYS.map((key) => (
        <div key={key} className="text-center">
          <p className="text-3xl font-bold text-primary sm:text-4xl">
            {formatCompactCount(values[key], locale)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(`${key}.label`)}
          </p>
        </div>
      ))}
    </section>
  );
}
