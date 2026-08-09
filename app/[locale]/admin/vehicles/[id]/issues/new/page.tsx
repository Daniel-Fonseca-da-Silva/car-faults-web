import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { KnownIssueForm } from "@/components/admin/known-issue-form";
import { SiteShell } from "@/components/layout/site-shell";
import { routing } from "@/i18n/routing";
import { requireAdminUser } from "@/lib/admin/require-admin-user";
import { getAdminVehicleModel } from "@/lib/api/admin-vehicles.server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface NewKnownIssuePageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: NewKnownIssuePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.admin" });

  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  };
}

export default async function NewKnownIssuePage({
  params,
}: NewKnownIssuePageProps) {
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
  const vehicleLabel = `${detail.vehicle.brand} ${detail.vehicle.model}`;

  return (
    <SiteShell className="py-12 sm:py-16">
      <h1 className="text-2xl font-semibold text-foreground">
        {t("newIssuePage.title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("newIssuePage.description", { vehicle: vehicleLabel })}
      </p>

      <div className="mt-6 max-w-2xl">
        <KnownIssueForm vehicleModelId={detail.vehicle.id} />
      </div>
    </SiteShell>
  );
}
