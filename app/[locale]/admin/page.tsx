import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Locale } from "@/i18n/locales";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { requireAdminUser } from "@/lib/admin/require-admin-user";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface AdminPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: AdminPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.admin" });

  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/admin",
    locale,
    noIndex: true,
  });
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!(await requireAdminUser())) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations("admin");

  return (
    <SiteShell className="py-12 sm:py-16">
      <h1 className="text-2xl font-semibold text-foreground">
        {t("dashboard.title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("dashboard.description")}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-foreground">
              {t("dashboard.vehiclesCardTitle")}
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("dashboard.vehiclesCardDescription")}
            </p>
            <Button size="sm" render={<Link href="/admin/vehicles" />} nativeButton={false}>
              {t("dashboard.goToVehicles")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </SiteShell>
  );
}
