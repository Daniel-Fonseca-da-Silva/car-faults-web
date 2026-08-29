import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { AdminVehiclesTable } from "@/components/admin/admin-vehicles-table";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n/locales";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { requireAdminUser } from "@/lib/admin/require-admin-user";
import { getAdminVehicleModels } from "@/lib/api/admin-vehicles.server";
import { ADMIN_VEHICLES_PAGE_SIZE } from "@/lib/lists/page-sizes";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface AdminVehiclesPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ brand?: string; model?: string }>;
}

export async function generateMetadata({
  params,
}: AdminVehiclesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.admin" });

  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/admin/vehicles",
    locale,
    noIndex: true,
  });
}

export default async function AdminVehiclesPage({
  params,
  searchParams,
}: AdminVehiclesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!(await requireAdminUser())) {
    redirect(`/${locale}/login`);
  }

  const { brand, model } = await searchParams;
  const t = await getTranslations("admin");
  const { items, nextCursor } = await getAdminVehicleModels({
    limit: ADMIN_VEHICLES_PAGE_SIZE,
    brand,
    model,
  });

  return (
    <SiteShell className="py-12 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {t("vehicles.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("vehicles.description")}
          </p>
        </div>
        <Button render={<Link href="/admin/vehicles/new" />} nativeButton={false}>
          {t("vehicles.newVehicle")}
        </Button>
      </div>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label htmlFor="brand" className="text-sm font-medium text-foreground">
            {t("vehicles.searchBrandPlaceholder")}
          </label>
          <Input id="brand" name="brand" defaultValue={brand ?? ""} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="model" className="text-sm font-medium text-foreground">
            {t("vehicles.searchModelPlaceholder")}
          </label>
          <Input id="model" name="model" defaultValue={model ?? ""} />
        </div>
        <Button type="submit" variant="outline">
          {t("vehicles.search")}
        </Button>
      </form>

      <div className="mt-6">
        <AdminVehiclesTable
          initialItems={items}
          initialCursor={nextCursor}
          brand={brand}
          model={model}
        />
      </div>
    </SiteShell>
  );
}
