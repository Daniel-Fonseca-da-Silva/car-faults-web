import type { Metadata } from "next";
import { Car, SearchCheck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { FaultsInfiniteList } from "@/components/faults/faults-infinite-list";
import { SiteShell } from "@/components/layout/site-shell";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import type { Locale } from "@/i18n/locales";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getPlatformFaults } from "@/lib/api/platform";
import { getCatalogBrands } from "@/lib/api/platform-catalog";
import { DEFECTS_HUB_PAGE_SIZE } from "@/lib/lists/page-sizes";
import { mapLookupLanguage } from "@/lib/lookup/map-lookup-language";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

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

  const year = yearParam ? Number(yearParam) : undefined;
  const doors = doorsParam ? Number(doorsParam) : undefined;

  const hasQuery = Boolean(make || model || year || fuel || doors);
  const t = await getTranslations("faults.hub");
  const brands = await getCatalogBrands();
  const language = mapLookupLanguage(locale);

  const faultsQuery = {
    locale: language,
    brand: make,
    model,
    year,
    fuelType: fuel,
    doors,
  };

  const { items: entries, nextCursor } = await getPlatformFaults({
    ...faultsQuery,
    limit: DEFECTS_HUB_PAGE_SIZE,
  });

  return (
    <SiteShell className="py-12 sm:py-16">
      <Stagger>
        <StaggerItem>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-12">
              <SearchCheck className="size-5 sm:size-6" aria-hidden="true" />
            </span>
            {t("title")}
          </h1>
        </StaggerItem>
        <StaggerItem>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {hasQuery
              ? t("resultsFor", {
                  query: [make, model, year].filter(Boolean).join(" "),
                })
              : t("subtitle")}
          </p>
        </StaggerItem>
      </Stagger>

      <div className="mt-8">
        <FaultsInfiniteList
          initialItems={entries}
          initialCursor={nextCursor}
          query={faultsQuery}
        />
      </div>

      <Reveal className="mt-14">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <Car className="size-5 text-primary" aria-hidden="true" />
          {t("browseBrandsTitle")}
        </h2>
      </Reveal>
      <div className="mt-4">
        {brands.length > 0 ? (
          <Stagger className="flex flex-wrap gap-2" stagger={0.02}>
            {brands.map((brand) => (
              <StaggerItem key={brand.slug} hoverLift>
                <Link
                  href={`/defects/${brand.slug}`}
                  className="block rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {brand.name}
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <p className="text-muted-foreground">{t("noBrands")}</p>
        )}
      </div>
    </SiteShell>
  );
}
