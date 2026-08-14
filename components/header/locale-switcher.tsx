"use client";

import { useLocale, useTranslations } from "next-intl";

import { LocaleFlag } from "@/components/header/locale-flag";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { routing, type Locale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();

  function handleValueChange(nextLocale: Locale | null) {
    if (!nextLocale) return;
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <Select value={locale as Locale} onValueChange={handleValueChange}>
      <SelectTrigger size="sm" aria-label={t("language")}>
        <LocaleFlag locale={locale as Locale} />
        <SelectValue>{t(`locales.${locale}`)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((availableLocale) => (
          <SelectItem key={availableLocale} value={availableLocale}>
            <LocaleFlag locale={availableLocale} />
            {t(`locales.${availableLocale}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
