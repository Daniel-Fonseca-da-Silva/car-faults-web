import { Geist, Geist_Mono } from "next/font/google";

import { SsrInlineScript } from "@/components/scripts/ssr-inline-script";
import {
  COOKIE_CONSENT_ACCEPTED_VALUE,
  COOKIE_CONSENT_NAME,
} from "@/lib/cookies/consent";

const googleConsentModeDefaultScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
(function () {
  var match = document.cookie.match(new RegExp('(?:^|; )${COOKIE_CONSENT_NAME}=([^;]*)'));
  if (match && decodeURIComponent(match[1]) === '${COOKIE_CONSENT_ACCEPTED_VALUE}') {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
  }
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface HtmlDocumentProps {
  lang: string;
  children: React.ReactNode;
}

/**
 * The <html> document. Rendered by the [locale] layout (and the root
 * not-found page) instead of the root layout, which has no locale param:
 * resolving it there with getLocale() reads the request headers, and that
 * makes every cached (ISR) page fail with DYNAMIC_SERVER_USAGE.
 */
export function HtmlDocument({ lang, children }: HtmlDocumentProps) {
  return (
    <html
      lang={lang}
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* App Router document head; the rule only exempts files under app/. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <SsrInlineScript
          id="google-consent-mode-default"
          html={googleConsentModeDefaultScript}
        />
      </head>
      <body className="min-h-full flex flex-col bg-grid-pattern">
        {children}
      </body>
    </html>
  );
}
