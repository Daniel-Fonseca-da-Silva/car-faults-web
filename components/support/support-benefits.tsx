import { getTranslations } from "next-intl/server";

import { Card } from "@/components/ui/card";

const BENEFIT_KEYS = ["servers", "features", "coffee"] as const;

export async function SupportBenefits() {
  const t = await getTranslations("support");

  return (
    <section className="mt-12">
      <h2 className="font-heading text-xl font-semibold tracking-tight">
        {t("benefitsTitle")}
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {BENEFIT_KEYS.map((key) => (
          <Card key={key} className="p-5">
            <span className="text-2xl" aria-hidden="true">
              {t(`benefits.${key}.emoji`)}
            </span>
            <p className="mt-3 font-semibold text-foreground">
              {t(`benefits.${key}.title`)}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {t(`benefits.${key}.body`)}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
