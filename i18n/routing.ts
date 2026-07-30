import { defineRouting } from "next-intl/routing";

import { defaultLocale, locales, type Locale } from "./locales";

export { defaultLocale, locales, type Locale };

export const routing = defineRouting({
  locales,
  defaultLocale,
});
