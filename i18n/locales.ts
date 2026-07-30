export const locales = ["pt-PT", "en-GB", "es-ES"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt-PT";
