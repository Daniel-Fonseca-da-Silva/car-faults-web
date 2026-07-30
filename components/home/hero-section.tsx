import { getTranslations } from "next-intl/server";

export async function HeroSection() {
  const t = await getTranslations("home.hero");

  return (
    <section className="pt-16 pb-10 text-center sm:pt-24 sm:pb-14">
      <p className="text-sm font-semibold tracking-widest text-primary uppercase">
        {t("eyebrow")}
      </p>
      <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
        {t("titleBeforeHighlight")}{" "}
        <span className="text-glow text-primary">{t("titleHighlight")}</span>{" "}
        {t("titleAfterHighlight")}
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
        {t("subtitle")}
      </p>
    </section>
  );
}
