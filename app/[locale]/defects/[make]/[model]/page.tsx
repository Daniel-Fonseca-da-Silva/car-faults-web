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
import {
  getCatalogBrand,
  getCatalogModel,
  getCatalogVariants,
} from "@/lib/api/platform-catalog";
import { buildLookupHref } from "@/lib/lookup/build-lookup-href";
import { mapLookupLanguage } from "@/lib/lookup/map-lookup-language";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";
import { formatYearRange } from "@/lib/utils";

const TOP_FAULTS_LIMIT = 9;

interface ModelHubPageParams {
  locale: Locale;
  make: string;
  model: string;
}

interface ModelHubPageProps {
  params: Promise<ModelHubPageParams>;
}

async function resolveBrandAndModel(make: string, model: string) {
  const [brand, catalogModel] = await Promise.all([
    getCatalogBrand(make),
    getCatalogModel(make, model),
  ]);

  return brand && catalogModel ? { brand, catalogModel } : null;
}

export async function generateMetadata({
  params,
}: ModelHubPageProps): Promise<Metadata> {
  const { locale, make, model } = await params;
  const resolved = await resolveBrandAndModel(make, model);
  if (!resolved) return {};

  const t = await getTranslations({ locale, namespace: "seo.modelPage" });
  const templateValues = {
    make: resolved.brand.name,
    model: resolved.catalogModel.name,
  };

  return buildPageMetadata({
    title: t("titleTemplate", templateValues),
    description: t("descriptionTemplate", templateValues),
    path: `/defects/${make}/${model}`,
    locale,
  });
}

export default async function ModelHubPage({ params }: ModelHubPageProps) {
  const { locale, make, model } = await params;
  setRequestLocale(locale);

  const resolved = await resolveBrandAndModel(make, model);
  if (!resolved) {
    notFound();
  }
  const { brand, catalogModel } = resolved;

  const [variants, t, tNav, tCommon] = await Promise.all([
    getCatalogVariants(make, model),
    getTranslations("faults.modelHub"),
    getTranslations("nav"),
    getTranslations("common"),
  ]);

  const { items: topFaults } = await getPlatformFaults({
    locale: mapLookupLanguage(locale),
    brand: brand.name,
    model: catalogModel.name,
    limit: TOP_FAULTS_LIMIT,
  });

  return (
    <SiteShell className="py-12 sm:py-16">
      <PageBreadcrumbs
        locale={locale}
        items={[
          { label: tCommon("breadcrumbs.home"), path: "" },
          { label: tNav("defects"), path: "/defects" },
          { label: brand.name, path: `/defects/${make}` },
          { label: catalogModel.name },
        ]}
      />

      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        {brand.name} {catalogModel.name}
      </h1>

      <h2 className="mt-10 text-xl font-semibold text-foreground">
        {t("variantsTitle")}
      </h2>
      <div className="mt-4">
        {variants.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {variants.map((variant) => {
              const href = buildLookupHref({
                brand: variant.brand,
                model: variant.model,
                year: variant.yearFrom,
                engine: variant.engine,
                fuelType: variant.fuelType,
                doors: variant.doors,
              });
              return (
                <Card
                  key={`${variant.yearFrom}-${variant.fuelType}-${variant.engine}-${variant.doors ?? ""}`}
                  className="transition-colors hover:border-primary/50"
                >
                  <CardContent className="p-4">
                    <Link
                      href={href}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {formatYearRange(variant.yearFrom, null)} ·{" "}
                      {variant.engine}
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">{t("noVariants")}</p>
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
