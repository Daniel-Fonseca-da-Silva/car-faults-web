import { getTranslations } from "next-intl/server";

export async function LegalSectionNav() {
  const t = await getTranslations("privacy");

  return (
    <nav
      aria-label={t("nav.privacy")}
      className="flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-6 text-sm font-medium"
    >
      <a
        href="#privacy"
        className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {t("nav.privacy")}
      </a>
      <a
        href="#terms"
        className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {t("nav.terms")}
      </a>
    </nav>
  );
}
