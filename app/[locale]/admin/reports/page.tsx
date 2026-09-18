import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { AdminReportsTable } from "@/components/admin/admin-reports-table";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { Locale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { requireAdminUser } from "@/lib/admin/require-admin-user";
import { getAdminReports } from "@/lib/api/admin-reports.server";
import { ADMIN_REPORTS_PAGE_SIZE } from "@/lib/lists/page-sizes";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";
import type { AdminReportStatus } from "@/types/admin";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface AdminReportsPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ status?: AdminReportStatus }>;
}

export async function generateMetadata({
  params,
}: AdminReportsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.admin" });

  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/admin/reports",
    locale,
    noIndex: true,
  });
}

export default async function AdminReportsPage({
  params,
  searchParams,
}: AdminReportsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!(await requireAdminUser())) {
    redirect(`/${locale}/login`);
  }

  const { status } = await searchParams;
  const t = await getTranslations("admin");
  const { items, nextCursor } = await getAdminReports({
    limit: ADMIN_REPORTS_PAGE_SIZE,
    status,
  });

  return (
    <SiteShell className="py-12 sm:py-16">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {t("reports.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("reports.description")}
        </p>
      </div>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label htmlFor="status" className="text-sm font-medium text-foreground">
            {t("reports.filterStatus")}
          </label>
          <NativeSelect id="status" name="status" defaultValue={status ?? ""}>
            <NativeSelectOption value="">
              {t("reports.statusAll")}
            </NativeSelectOption>
            <NativeSelectOption value="pending">
              {t("reports.status.pending")}
            </NativeSelectOption>
            <NativeSelectOption value="reviewed">
              {t("reports.status.reviewed")}
            </NativeSelectOption>
            <NativeSelectOption value="dismissed">
              {t("reports.status.dismissed")}
            </NativeSelectOption>
          </NativeSelect>
        </div>
        <Button type="submit" variant="outline">
          {t("reports.filterApply")}
        </Button>
      </form>

      <div className="mt-6">
        <AdminReportsTable
          initialItems={items}
          initialCursor={nextCursor}
          status={status}
        />
      </div>
    </SiteShell>
  );
}
