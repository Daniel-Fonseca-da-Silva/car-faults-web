import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

import { getPlatformStats } from "@/lib/api/platform";
import { formatCompactCount } from "@/lib/utils";

const HERO_IMAGE_SRC = "/login/classic-mini-shadowy-garage.webp";

export async function LoginHeroPanel() {
  const [t, locale, stats] = await Promise.all([
    getTranslations("auth.hero"),
    getLocale(),
    getPlatformStats(),
  ]);

  return (
    <section className="relative h-[45vh] w-full overflow-hidden sm:h-[50vh] lg:h-auto lg:min-h-[calc(100dvh-4rem)]">
      <Image
        src={HERO_IMAGE_SRC}
        alt={t("imageAlt")}
        fill
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10"
      />

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
        <p className="text-sm font-semibold tracking-widest text-primary uppercase">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 max-w-md text-2xl font-bold text-balance sm:text-3xl">
          {t("titleBeforeHighlight")}{" "}
          <span className="text-glow text-primary">
            {t("titleHighlight")}
          </span>{" "}
          {t("titleAfterHighlight")}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("stat", {
            count: formatCompactCount(stats.faultsCount, locale),
          })}
        </p>
      </div>
    </section>
  );
}
