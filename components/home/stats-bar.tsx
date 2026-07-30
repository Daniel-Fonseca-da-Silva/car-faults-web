import { getTranslations } from "next-intl/server";

const STAT_KEYS = ["reports", "vehicles", "faults"] as const;

export async function StatsBar() {
  const t = await getTranslations("home.stats");

  return (
    <section className="mx-auto grid max-w-2xl grid-cols-1 gap-6 py-10 sm:grid-cols-3">
      {STAT_KEYS.map((key) => (
        <div key={key} className="text-center">
          <p className="text-3xl font-bold text-primary sm:text-4xl">
            {t(`${key}.value`)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(`${key}.label`)}
          </p>
        </div>
      ))}
    </section>
  );
}
