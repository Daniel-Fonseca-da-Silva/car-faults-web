"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function LoginToCommentCta() {
  const t = useTranslations("faults");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
      <p>{t("vehicle.comments.loginToComment")}</p>
      <Button render={<Link href="/login" />} nativeButton={false} size="sm">
        {t("vehicle.comments.loginCta")}
      </Button>
    </div>
  );
}
