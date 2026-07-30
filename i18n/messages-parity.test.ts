import { locales } from "./locales";
import { messageNamespaces } from "./message-namespaces";

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) {
    return [prefix];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, nested]) => flattenKeys(nested, prefix ? `${prefix}.${key}` : key)
  );
}

describe("message catalog parity", () => {
  it.each(messageNamespaces)(
    "has the same keys across all locales for the %s namespace",
    (namespace) => {
      const keysByLocale = locales.map((locale) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const messages = require(`../messages/${locale}/${namespace}.json`);
        return { locale, keys: flattenKeys(messages).sort() };
      });

      const [reference, ...rest] = keysByLocale;

      for (const { locale, keys } of rest) {
        expect({ locale, keys }).toEqual({ locale, keys: reference.keys });
      }
    }
  );
});
