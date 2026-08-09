import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { buildBreadcrumbJsonLd, serializeJsonLd } from "@/lib/seo/json-ld";

export interface PageBreadcrumbItem {
  label: string;
  /** Locale-relative path (no locale prefix), e.g. "/defects/vw". Omit for the current page. */
  path?: string;
}

interface PageBreadcrumbsProps {
  locale: Locale;
  items: PageBreadcrumbItem[];
}

export function PageBreadcrumbs({ locale, items }: PageBreadcrumbsProps) {
  const jsonLd = buildBreadcrumbJsonLd(
    items.map((item) => ({
      name: item.label,
      path: `/${locale}${item.path ?? ""}`,
    }))
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <Fragment key={`${item.label}-${index}`}>
                <BreadcrumbItem>
                  {item.path && !isLast ? (
                    <BreadcrumbLink render={<Link href={item.path} />}>
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
