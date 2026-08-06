import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { KnownIssueDeleteButton } from "@/components/admin/known-issue-delete-button";
import { VehicleDeleteButton } from "@/components/admin/vehicle-delete-button";
import { VehicleModelForm } from "@/components/admin/vehicle-model-form";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { requireAdminUser } from "@/lib/admin/require-admin-user";
import { getAdminVehicleModel } from "@/lib/api/admin-vehicles";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface AdminVehicleDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: AdminVehicleDetailPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.admin" });

  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  };
}

export default async function AdminVehicleDetailPage({
  params,
}: AdminVehicleDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  if (!(await requireAdminUser())) {
    redirect(`/${locale}/login`);
  }

  const detail = await getAdminVehicleModel(id);
  if (!detail) {
    notFound();
  }

  const t = await getTranslations("admin");
  const { vehicle, knownIssues } = detail;
  const vehicleLabel = `${vehicle.brand} ${vehicle.model}`;

  return (
    <SiteShell className="py-12 sm:py-16">
      <Link
        href="/admin/vehicles"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← {t("vehicleDetail.backToVehicles")}
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold text-foreground">
          {vehicleLabel}
        </h1>
        <VehicleDeleteButton vehicleId={vehicle.id} vehicleLabel={vehicleLabel} />
      </div>

      <div className="mt-6 max-w-2xl">
        <VehicleModelForm vehicle={vehicle} />
      </div>

      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">
            {t("vehicleDetail.knownIssuesTitle")}
          </h2>
          <Button
            size="sm"
            render={<Link href={`/admin/vehicles/${vehicle.id}/issues/new`} />}
            nativeButton={false}
          >
            {t("vehicleDetail.addIssue")}
          </Button>
        </div>

        <div className="mt-4">
          {knownIssues.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("vehicleDetail.noIssues")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("vehicleDetail.columnTitle")}</TableHead>
                  <TableHead>{t("vehicleDetail.columnSeverity")}</TableHead>
                  <TableHead>{t("vehicleDetail.columnLocale")}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {knownIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell>
                      <Link
                        href={`/admin/issues/${issue.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {issue.title}
                      </Link>
                    </TableCell>
                    <TableCell>{issue.severity}</TableCell>
                    <TableCell>{issue.locale}</TableCell>
                    <TableCell>
                      <KnownIssueDeleteButton
                        knownIssueId={issue.id}
                        vehicleModelId={vehicle.id}
                        issueTitle={issue.title}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
