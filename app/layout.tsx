import type { Metadata } from "next";
import "./globals.css";

import { getSiteUrl } from "@/lib/seo/get-site-url";
import { getSiteName } from "@/lib/seo/site-brand";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: getSiteName(),
    template: `%s | ${getSiteName()}`,
  },
  description:
    "Chronic reliability by vehicle model - known issues by make, model, year and engine.",
  openGraph: {
    siteName: getSiteName(),
    type: "website",
    images: [
      {
        url: "/feature-graphic.png",
        width: 1024,
        height: 500,
        alt: getSiteName(),
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/feature-graphic.png"],
  },
};

// <html> and <body> are rendered by HtmlDocument in the [locale] layout and
// in app/not-found.tsx, where the locale is known without reading headers.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
