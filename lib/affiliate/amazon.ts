import type { Locale } from "@/i18n/locales";

export interface AmazonStore {
  domain: string;
  tag: string;
}

const AMAZON_ES: AmazonStore = { domain: "www.amazon.es", tag: "autocronica17-21" };

/**
 * Portugal has no Amazon storefront of its own; Portuguese buyers use Amazon.es.
 * Locales without an Associates account get no affiliate links.
 */
const AMAZON_STORES: Partial<Record<Locale, AmazonStore>> = {
  "es-ES": AMAZON_ES,
  "pt-PT": AMAZON_ES,
  "en-GB": { domain: "www.amazon.co.uk", tag: "autocronicagb-21" },
  "de-DE": { domain: "www.amazon.de", tag: "autocronicade-21" },
  "fr-FR": { domain: "www.amazon.fr", tag: "autocronicafr-21" },
  "it-IT": { domain: "www.amazon.it", tag: "autocronicait-21" },
};

export function getAmazonStore(locale: string): AmazonStore | null {
  return AMAZON_STORES[locale as Locale] ?? null;
}

export function buildAmazonSearchUrl(store: AmazonStore, query: string): string {
  const params = new URLSearchParams({ k: query.trim(), tag: store.tag });
  return `https://${store.domain}/s?${params.toString()}`;
}
