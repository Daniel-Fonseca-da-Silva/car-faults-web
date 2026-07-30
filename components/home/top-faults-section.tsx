import { getTranslations } from "next-intl/server";

import { FaultCardGrid } from "@/components/faults/fault-card-grid";
import { topFaults } from "@/lib/mocks/top-faults";

export async function TopFaultsSection() {
  const t = await getTranslations("home.topFaults");

  return (
    <section className="py-12 sm:py-16">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
      </div>
      <FaultCardGrid entries={topFaults} />
    </section>
  );
}
