import ES from "country-flag-icons/react/3x2/ES";
import GB from "country-flag-icons/react/3x2/GB";
import PT from "country-flag-icons/react/3x2/PT";

import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

const FLAGS: Record<Locale, typeof PT> = {
  "pt-PT": PT,
  "en-GB": GB,
  "es-ES": ES,
};

type LocaleFlagProps = {
  locale: Locale;
  className?: string;
};

export function LocaleFlag({ locale, className }: LocaleFlagProps) {
  const Flag = FLAGS[locale];

  return (
    <Flag aria-hidden="true" className={cn("h-3.5 w-5 shrink-0 rounded-sm", className)} />
  );
}
