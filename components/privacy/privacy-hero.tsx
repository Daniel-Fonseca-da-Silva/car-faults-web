import { getTranslations } from "next-intl/server";
import Image from "next/image";

const HERO_IMAGE_SRC = "/privacy-term/Fiat-500-docs.webp";

export async function PrivacyHero() {
  const t = await getTranslations("privacy");

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl sm:aspect-[21/9]">
      <Image
        src={HERO_IMAGE_SRC}
        alt={t("hero.imageAlt")}
        fill
        priority
        sizes="(min-width: 1024px) 1024px, 100vw"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10"
      />

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
        <p className="text-sm font-semibold tracking-widest text-primary uppercase">
          {t("hero.eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {t("hero.title")}
        </h1>
      </div>
    </div>
  );
}
