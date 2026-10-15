import Link from "next/link";

import {
  BACK_HOME_LINK_CLASS_NAME,
  NotFoundContent,
} from "@/components/layout/not-found-content";
import { buttonVariants } from "@/components/ui/button";
import common from "@/messages/pt-PT/common.json";

// Fallback for requests that skip the proxy (static asset extensions, e.g. a
// missing /foo.png): they never get a locale prefix and the [locale] layout
// rejects them before its own not-found boundary applies. Without this file
// Next would render its generic 404.
//
// Next renders this boundary as part of every page, outside the [locale]
// segment where setRequestLocale runs. next-intl's request APIs
// (getTranslations, its server Link and NextIntlClientProvider) would fall
// back to reading the locale from the request headers here, which turns
// every cached page dynamic and fails it with DYNAMIC_SERVER_USAGE. So this
// page reads the default locale's messages directly and uses next/link ("/"
// lets the proxy pick the visitor's locale).
export default function RootNotFound() {
  const t = common.notFound;

  return (
    <main className="flex-1">
      <NotFoundContent
        title={t.title}
        description={t.description}
        imageAlt={t.imageAlt}
        homeLink={
          <Link
            href="/"
            className={buttonVariants({
              size: "lg",
              className: BACK_HOME_LINK_CLASS_NAME,
            })}
          >
            {t.backHome}
          </Link>
        }
      />
    </main>
  );
}
