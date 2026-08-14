import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Locale } from "@/i18n/locales";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { requireAdminUser } from "@/lib/admin/require-admin-user";
import { getAdminVehicleModels } from "@/lib/api/admin-vehicles.server";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

const PAGE_SIZE = 20;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface AdminVehiclesPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ page?: string; brand?: string; model?: string }>;
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

  const { page: pageParam, brand, model } = await searchParams;
  const page = pageParam ? Math.max(1, Number(pageParam) || 1) : 1;

  const t = await getTranslations("admin");
  const { items, total } = await getAdminVehicleModels({
    page,
    limit: PAGE_SIZE,
    brand,
    model,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildQuery(nextPage: number): string {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (brand) params.set("brand", brand);
    if (model) params.set("model", model);
    return `?${params.toString()}`;
  }

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
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("vehicles.empty")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("vehicles.columnBrand")}</TableHead>
                <TableHead>{t("vehicles.columnModel")}</TableHead>
                <TableHead>{t("vehicles.columnYears")}</TableHead>
                <TableHead>{t("vehicles.columnEngine")}</TableHead>
                <TableHead>{t("vehicles.columnFuelType")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <Link
                      href={`/admin/vehicles/${vehicle.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {vehicle.brand}
                    </Link>
                  </TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>
                    {vehicle.yearFrom}
                    {vehicle.yearTo && vehicle.yearTo !== vehicle.yearFrom
                      ? `–${vehicle.yearTo}`
                      : ""}
                  </TableCell>
                  <TableCell>{vehicle.engine}</TableCell>
                  <TableCell>{vehicle.fuelType ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-3">
          {page <= 1 ? (
            <Button variant="outline" size="sm" disabled>
              {t("vehicles.previous")}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/admin/vehicles${buildQuery(page - 1)}`} />}
              nativeButton={false}
            >
              {t("vehicles.previous")}
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            {t("vehicles.pageInfo", { page, totalPages })}
          </span>
          {page >= totalPages ? (
            <Button variant="outline" size="sm" disabled>
              {t("vehicles.next")}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/admin/vehicles${buildQuery(page + 1)}`} />}
              nativeButton={false}
            >
              {t("vehicles.next")}
            </Button>
          )}
        </div>
      )}
    </SiteShell>
  );
}
