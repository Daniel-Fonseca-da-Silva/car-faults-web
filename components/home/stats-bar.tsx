import { getLocale, getTranslations } from "next-intl/server";

import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { getPlatformStats } from "@/lib/api/platform";

import { AnimatedCount } from "./animated-count";

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
    <section className="mx-auto max-w-2xl py-10">
      <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-3" stagger={0.15}>
        {STAT_KEYS.map((key) => (
          <StaggerItem key={key} className="text-center">
            <AnimatedCount
              value={values[key]}
              locale={locale}
              className="text-3xl font-bold text-primary tabular-nums sm:text-4xl"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              {t(`${key}.label`)}
            </p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
