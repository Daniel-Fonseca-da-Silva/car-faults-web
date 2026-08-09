import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { FaultCardGrid } from "@/components/faults/fault-card-grid";
import { SiteShell } from "@/components/layout/site-shell";
import { PageBreadcrumbs } from "@/components/seo/page-breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import type { Locale } from "@/i18n/locales";
import { Link } from "@/i18n/navigation";
import { getPlatformFaults } from "@/lib/api/platform";
import { getCatalogBrand, getCatalogModels } from "@/lib/api/platform-catalog";
import { mapLookupLanguage } from "@/lib/lookup/map-lookup-language";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

const TOP_FAULTS_LIMIT = 9;

interface BrandHubPageParams {
  locale: Locale;
  make: string;
}

interface BrandHubPageProps {
  params: Promise<BrandHubPageParams>;
}

export async function generateMetadata({
  params,
}: BrandHubPageProps): Promise<Metadata> {
  const { locale, make } = await params;
  const brand = await getCatalogBrand(make);
  if (!brand) return {};

  const t = await getTranslations({ locale, namespace: "seo.brandPage" });
  const templateValues = { make: brand.name };

  return buildPageMetadata({
    title: t("titleTemplate", templateValues),
    description: t("descriptionTemplate", templateValues),
    path: `/defects/${make}`,
    locale,
  });
}

export default async function BrandHubPage({ params }: BrandHubPageProps) {
  const { locale, make } = await params;
  setRequestLocale(locale);

  const brand = await getCatalogBrand(make);
  if (!brand) {
    notFound();
  }

  const [models, t, tNav, tCommon] = await Promise.all([
    getCatalogModels(make),
    getTranslations("faults.brandHub"),
    getTranslations("nav"),
    getTranslations("common"),
  ]);

  const { items: topFaults } = await getPlatformFaults({
    locale: mapLookupLanguage(locale),
    brand: brand.name,
    limit: TOP_FAULTS_LIMIT,
  });

  return (
    <SiteShell className="py-12 sm:py-16">
      <PageBreadcrumbs
        locale={locale}
        items={[
          { label: tCommon("breadcrumbs.home"), path: "" },
          { label: tNav("defects"), path: "/defects" },
          { label: brand.name },
        ]}
      />

      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        {t("modelsTitle", { make: brand.name })}
      </h1>

      <div className="mt-8">
        {models.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {models.map((model) => (
              <Card
                key={model.slug}
                className="transition-colors hover:border-primary/50"
              >
                <CardContent className="p-4">
                  <Link
                    href={`/defects/${make}/${model.slug}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {model.name}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t("noModels")}</p>
        )}
      </div>

      <h2 className="mt-12 text-xl font-semibold text-foreground">
        {t("topFaultsTitle")}
      </h2>
      <div className="mt-6">
        {topFaults.length > 0 ? (
          <FaultCardGrid entries={topFaults} />
        ) : (
          <p className="text-muted-foreground">{t("noFaults")}</p>
        )}
      </div>
    </SiteShell>
  );
}
