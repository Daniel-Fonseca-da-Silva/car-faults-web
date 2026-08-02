import { getLocale, getTranslations } from "next-intl/server";

import { FaultCardGrid } from "@/components/faults/fault-card-grid";
import { getTopFaults } from "@/lib/api/platform";
import { mapLookupLanguage } from "@/lib/lookup/map-lookup-language";

export async function TopFaultsSection() {
  const [t, locale] = await Promise.all([
    getTranslations("home.topFaults"),
    getLocale(),
  ]);
  const entries = await getTopFaults(mapLookupLanguage(locale));

  return (
    <section className="py-12 sm:py-16">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
      </div>
      {entries.length > 0 ? (
        <FaultCardGrid entries={entries} />
      ) : (
        <p className="text-muted-foreground">{t("empty")}</p>
      )}
    </section>
  );
}
