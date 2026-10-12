import { NextIntlClientProvider } from "next-intl";

import LocaleNotFound from "./[locale]/not-found";

// Fallback for requests that skip the proxy (static asset extensions, e.g. a
// missing /foo.png): they never get a locale prefix and the [locale] layout
// rejects them before its own not-found boundary applies. Without this file
// Next would render its generic 404. The header is left out on purpose: it
// fetches the current user, and these hits rarely come from real visitors.
export default function RootNotFound() {
  return (
    <NextIntlClientProvider>
      <main className="flex-1">
        <LocaleNotFound />
      </main>
    </NextIntlClientProvider>
  );
}
