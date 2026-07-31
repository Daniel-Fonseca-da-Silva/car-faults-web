import type { Locale } from "@/i18n/locales";

export type LookupLanguage = "pt-PT" | "en-GB" | "es-ES";

export function mapLookupLanguage(locale: Locale): LookupLanguage {
  return locale;
}
