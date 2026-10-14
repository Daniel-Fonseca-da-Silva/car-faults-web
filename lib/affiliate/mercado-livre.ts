import type { Locale } from "@/i18n/locales";

export type MercadoLivreProductId =
  | "steeringWheelCover"
  | "lubricantSpray"
  | "engineOil"
  | "battery"
  | "wipers"
  | "tools"
  | "headlightBulbs";

export interface MercadoLivreProduct {
  id: MercadoLivreProductId;
  url: string;
}

/**
 * Mercado Livre only credits links made in its affiliate link generator
 * (tag "autocronicasite"), so these are fixed category searches, not per-issue links.
 */
const MERCADO_LIVRE_PRODUCTS: Partial<Record<Locale, MercadoLivreProduct[]>> = {
  "pt-BR": [
    { id: "steeringWheelCover", url: "https://meli.la/1HAZuaY" },
    { id: "lubricantSpray", url: "https://meli.la/13NUe5Y" },
    { id: "engineOil", url: "https://meli.la/2Hb8JQy" },
    { id: "battery", url: "https://meli.la/1adfGt9" },
    { id: "wipers", url: "https://meli.la/1rEFYEs" },
    { id: "tools", url: "https://meli.la/1kFNq5n" },
    { id: "headlightBulbs", url: "https://meli.la/1EmYA4g" },
  ],
};

export function getMercadoLivreProducts(locale: string): MercadoLivreProduct[] {
  return MERCADO_LIVRE_PRODUCTS[locale as Locale] ?? [];
}
