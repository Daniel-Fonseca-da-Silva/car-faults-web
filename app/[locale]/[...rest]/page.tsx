import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/locales";

interface CatchAllPageProps {
  params: Promise<{ locale: Locale }>;
}

// Catches any path under a valid locale prefix that doesn't match a real
// route (e.g. /en-GB/fsdg123), so it renders the locale-scoped
// not-found.tsx instead of falling through to Next's generic 404.
export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  notFound();
}
