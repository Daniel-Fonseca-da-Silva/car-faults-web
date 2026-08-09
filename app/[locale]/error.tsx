"use client";

import { useTranslations } from "next-intl";

import { Button, buttonVariants } from "@/components/ui/button";
import { SiteShell } from "@/components/layout/site-shell";
import { Link } from "@/i18n/navigation";

interface LocaleErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleError({ reset }: LocaleErrorProps) {
  const t = useTranslations("common.error");

  return (
    <SiteShell className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" className="h-11" onClick={() => reset()}>
          {t("tryAgain")}
        </Button>
        <Link
          href="/"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "h-11",
          })}
        >
          {t("backHome")}
        </Link>
      </div>
    </SiteShell>
  );
}
