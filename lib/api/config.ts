export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;

  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  return url;
}

export function getTurnstileSiteKey(): string {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    throw new Error("NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set");
  }

  return siteKey;
}

/**
 * Returns undefined when unset.
 * Without a client id the AdSense script stays off and units show a local placeholder.
 */
export function getAdsenseClientId(): string | undefined {
  return process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || undefined;
}
