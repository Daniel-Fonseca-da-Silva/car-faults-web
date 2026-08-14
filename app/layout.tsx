import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { getLocale } from "next-intl/server";
import "./globals.css";

import {
  COOKIE_CONSENT_ACCEPTED_VALUE,
  COOKIE_CONSENT_NAME,
} from "@/lib/cookies/consent";
import { getSiteUrl } from "@/lib/seo/get-site-url";
import { getSiteName } from "@/lib/seo/site-brand";

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

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: getSiteName(),
    template: `%s | ${getSiteName()}`,
  },
  description:
    "Chronic reliability by vehicle model - known issues by make, model, year and engine.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-grid-pattern">
        <Script
          id="google-consent-mode-default"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: googleConsentModeDefaultScript }}
        />
        {children}
      </body>
    </html>
  );
}
