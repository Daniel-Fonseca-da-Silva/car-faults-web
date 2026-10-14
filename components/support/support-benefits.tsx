import { getTranslations } from "next-intl/server";

import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";

const BENEFIT_KEYS = ["servers", "features", "coffee"] as const;

export async function SupportBenefits() {
  const t = await getTranslations("support");

  return (
    <section className="mt-12">
      <Reveal>
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          {t("benefitsTitle")}
        </h2>
      </Reveal>
      <Stagger className="mt-5 grid gap-4 sm:grid-cols-3">
        {BENEFIT_KEYS.map((key) => (
          <StaggerItem key={key} hoverLift>
            <Card className="h-full p-5 transition-shadow hover:shadow-lg">
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
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
