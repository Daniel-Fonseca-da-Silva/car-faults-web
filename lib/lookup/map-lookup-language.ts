import { defaultLocale, locales, type Locale } from "@/i18n/locales";

export type LookupLanguage = "pt-PT" | "en-GB" | "es-ES";

function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function mapLookupLanguage(locale: string): LookupLanguage {
  if (isLocale(locale)) {
    return locale;
  }

  return defaultLocale;
}
