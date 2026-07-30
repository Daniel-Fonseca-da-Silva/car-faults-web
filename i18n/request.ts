import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { messageNamespaces } from "./message-namespaces";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = Object.fromEntries(
    await Promise.all(
      messageNamespaces.map(async (namespace) => [
        namespace,
        (await import(`../messages/${locale}/${namespace}.json`)).default,
      ])
    )
  );

  return { locale, messages };
});
