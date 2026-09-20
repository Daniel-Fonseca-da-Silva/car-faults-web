import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";

const FOUNDER_PHOTO_SRC = "/help/polo-6n1.webp";

export async function SupportHero() {
  const t = await getTranslations("support");

  return (
    <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
      <Image
        src={FOUNDER_PHOTO_SRC}
        alt={t("photoAlt")}
        width={176}
        height={176}
        className="size-36 shrink-0 rounded-full object-cover sm:size-44"
        priority
      />
      <div>
        <Badge variant="secondary" className="h-auto px-3 py-1 text-xs">
          {t("badge")}
        </Badge>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm font-semibold text-foreground">
          {t("authorName")}
        </p>
        <p className="text-sm text-muted-foreground">{t("authorRole")}</p>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("intro")}
        </p>
      </div>
    </div>
  );
}
