"use client";

import { useLocale, useTranslations } from "next-intl";

import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { routing, type Locale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as Locale;
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <NativeSelect
      aria-label={t("language")}
      value={locale}
      onChange={handleChange}
      size="sm"
    >
      {routing.locales.map((availableLocale) => (
        <NativeSelectOption key={availableLocale} value={availableLocale}>
          {t(`locales.${availableLocale}`)}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}
