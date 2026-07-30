import { getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { SiteShell } from "@/components/layout/site-shell";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("common.notFound");

  return (
    <SiteShell className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      <Link href="/" className={buttonVariants({ size: "lg", className: "h-11" })}>
        {t("backHome")}
      </Link>
    </SiteShell>
  );
}
