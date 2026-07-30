import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/brand/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";

import { LocaleSwitcher } from "./locale-switcher";
import { MobileNav } from "./mobile-nav";

const NAV_ITEMS = ["recalls", "defects", "compare", "about"] as const;

export async function SiteHeader() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav
          aria-label={t("menu")}
          className="hidden items-center gap-6 md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item}
              href={`/${item}`}
              className="text-sm font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(item)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitcher />
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-full border border-border/60 py-1 pl-1 pr-3 transition-colors hover:bg-muted"
          >
            <Avatar title={t("avatarAlt", { name: "Ana" })}>
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">Ana.</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LocaleSwitcher />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
