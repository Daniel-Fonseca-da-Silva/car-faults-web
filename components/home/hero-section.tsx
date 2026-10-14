import { getTranslations } from "next-intl/server";

import { HeroContent } from "./hero-content";

export async function HeroSection() {
  const t = await getTranslations("home.hero");

  return (
    <section className="pt-16 pb-10 text-center sm:pt-24 sm:pb-14">
      <HeroContent
        eyebrow={t("eyebrow")}
        titleBeforeHighlight={t("titleBeforeHighlight")}
        titleHighlight={t("titleHighlight")}
        titleAfterHighlight={t("titleAfterHighlight")}
        subtitle={t("subtitle")}
      />
    </section>
  );
}
