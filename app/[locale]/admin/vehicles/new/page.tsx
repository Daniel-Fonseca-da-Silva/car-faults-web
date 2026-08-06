import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { VehicleModelForm } from "@/components/admin/vehicle-model-form";
import { SiteShell } from "@/components/layout/site-shell";
import { routing } from "@/i18n/routing";
import { requireAdminUser } from "@/lib/admin/require-admin-user";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface NewVehiclePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: NewVehiclePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.admin" });

  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  };
}

export default async function NewVehiclePage({
  params,
}: NewVehiclePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!(await requireAdminUser())) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations("admin");

  return (
    <SiteShell className="py-12 sm:py-16">
      <h1 className="text-2xl font-semibold text-foreground">
        {t("newVehiclePage.title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("newVehiclePage.description")}
      </p>

      <div className="mt-6 max-w-2xl">
        <VehicleModelForm />
      </div>
    </SiteShell>
  );
}
