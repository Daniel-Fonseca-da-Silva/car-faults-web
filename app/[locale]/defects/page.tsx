import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { FaultCardGrid } from "@/components/faults/fault-card-grid";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/locales";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getPlatformFaults } from "@/lib/api/platform";
import { getCatalogBrands } from "@/lib/api/platform-catalog";
import { mapLookupLanguage } from "@/lib/lookup/map-lookup-language";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

const PAGE_SIZE = 9;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type SearchParamValue = string | string[] | undefined;
type ResolvedSearchParams = Record<string, SearchParamValue>;

interface DefectsHubPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<ResolvedSearchParams>;
}

export async function generateMetadata({
  params,
}: DefectsHubPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.defectsHub" });

  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/defects",
    locale,
  });
}

function toQueryValue(value: SearchParamValue): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() || undefined;
}

export default async function DefectsHubPage({
  params,
  searchParams,
}: DefectsHubPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const resolvedSearchParams = await searchParams;
  const make = toQueryValue(resolvedSearchParams.make);
  const model = toQueryValue(resolvedSearchParams.model);
  const yearParam = toQueryValue(resolvedSearchParams.year);
  const fuel = toQueryValue(resolvedSearchParams.fuel);
  const doorsParam = toQueryValue(resolvedSearchParams.doors);
  const pageParam = toQueryValue(resolvedSearchParams.page);

  const year = yearParam ? Number(yearParam) : undefined;
  const doors = doorsParam ? Number(doorsParam) : undefined;
  const page = pageParam ? Math.max(1, Number(pageParam) || 1) : 1;

  const hasQuery = Boolean(make || model || year || fuel || doors);
  const t = await getTranslations("faults.hub");
  const brands = await getCatalogBrands();

  const { items: entries, total } = await getPlatformFaults({
    locale: mapLookupLanguage(locale),
    page,
    limit: PAGE_SIZE,
    brand: make,
    model,
    year,
    fuelType: fuel,
    doors,
  });

  function buildQuery(nextPage: number): string {
    const query = new URLSearchParams();
    query.set("page", String(nextPage));
    if (make) query.set("make", make);
    if (model) query.set("model", model);
    if (yearParam) query.set("year", yearParam);
    if (fuel) query.set("fuel", fuel);
    if (doorsParam) query.set("doors", doorsParam);
    return `?${query.toString()}`;
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <SiteShell className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        {hasQuery
          ? t("resultsFor", {
              query: [make, model, year].filter(Boolean).join(" "),
            })
          : t("subtitle")}
      </p>

      <div className="mt-8">
        {entries.length > 0 ? (
          <FaultCardGrid entries={entries} />
        ) : (
          <p className="text-muted-foreground">{t("empty")}</p>
        )}
      </div>

      {total > PAGE_SIZE && (
        <div className="mt-6 flex items-center justify-between gap-3">
          {page <= 1 ? (
            <Button variant="outline" size="sm" disabled>
              {t("previous")}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/defects${buildQuery(page - 1)}`} />}
              nativeButton={false}
            >
              {t("previous")}
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            {t("pageInfo", { page, totalPages })}
          </span>
          {page >= totalPages ? (
            <Button variant="outline" size="sm" disabled>
              {t("next")}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/defects${buildQuery(page + 1)}`} />}
              nativeButton={false}
            >
              {t("next")}
            </Button>
          )}
        </div>
      )}

      <h2 className="mt-14 text-xl font-semibold text-foreground">
        {t("browseBrandsTitle")}
      </h2>
      <div className="mt-4">
        {brands.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/defects/${brand.slug}`}
                className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t("noBrands")}</p>
        )}
      </div>
    </SiteShell>
  );
}
