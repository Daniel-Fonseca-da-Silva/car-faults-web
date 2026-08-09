import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/brand/logo";
import { Link } from "@/i18n/navigation";

import { CookieSettingsButton } from "./cookie-settings-button";
import { SocialLinks } from "./social-links";

export async function SiteFooter() {
  const t = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
        <Logo />

        <SocialLinks />

        <p className="text-xs text-muted-foreground">
          {t("footer.disclaimer")}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Link
            href="/privacy#privacy"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            {t("footer.legal.privacy")}
          </Link>
          <Link
            href="/privacy#terms"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            {t("footer.legal.terms")}
          </Link>
          <CookieSettingsButton />
        </div>

        <p className="text-xs text-muted-foreground">
          {t("footer.copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
