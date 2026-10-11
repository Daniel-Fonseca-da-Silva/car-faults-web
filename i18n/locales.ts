export const locales = [
  "pt-PT",
  "pt-BR",
  "en-GB",
  "en-US",
  "es-ES",
  "es-MX",
  "fr-FR",
  "de-DE",
  "it-IT",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt-PT";
