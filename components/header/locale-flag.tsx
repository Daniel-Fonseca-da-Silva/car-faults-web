import BR from "country-flag-icons/react/3x2/BR";
import DE from "country-flag-icons/react/3x2/DE";
import ES from "country-flag-icons/react/3x2/ES";
import FR from "country-flag-icons/react/3x2/FR";
import GB from "country-flag-icons/react/3x2/GB";
import IT from "country-flag-icons/react/3x2/IT";
import MX from "country-flag-icons/react/3x2/MX";
import PT from "country-flag-icons/react/3x2/PT";
import US from "country-flag-icons/react/3x2/US";

import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

const FLAGS: Record<Locale, typeof PT> = {
  "pt-PT": PT,
  "pt-BR": BR,
  "en-GB": GB,
  "en-US": US,
  "es-ES": ES,
  "es-MX": MX,
  "fr-FR": FR,
  "de-DE": DE,
  "it-IT": IT,
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
