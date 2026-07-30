import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
        <span className="font-heading text-base font-bold tracking-tight">
          <span className="text-primary">CAR</span>
          <span className="text-muted-foreground">FAULTS</span>
        </span>

        <p className="text-xs text-muted-foreground">
          {t("footer.disclaimer")}
        </p>

        <p className="text-xs text-muted-foreground">
          {t("footer.copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
