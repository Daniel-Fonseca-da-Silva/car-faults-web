import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { buttonVariants } from "@/components/ui/button";
import { SiteShell } from "@/components/layout/site-shell";
import { Link } from "@/i18n/navigation";

const NOT_FOUND_IMAGE_SRC = "/404/not-found.webp";

export default async function LocaleNotFound() {
  const t = await getTranslations("common.notFound");

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden sm:min-h-[80vh]">
      <Image
        src={NOT_FOUND_IMAGE_SRC}
        alt={t("imageAlt")}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40"
      />

      <SiteShell className="relative flex flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
        <Link href="/" className={buttonVariants({ size: "lg", className: "h-11" })}>
          {t("backHome")}
        </Link>
      </SiteShell>
    </div>
  );
}
