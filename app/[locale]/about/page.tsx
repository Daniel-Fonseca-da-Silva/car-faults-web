import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/locales";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

const LINKEDIN_PROFILE_URL =
  "https://www.linkedin.com/in/daniel-fonseca-da-silva/";
const FOUNDER_PHOTO_SRC = "/about/daniel-fonseca-da-silva.jpg";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface AboutPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.about" });

  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/about",
    locale,
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("about");

  return (
    <SiteShell className="max-w-3xl py-12 sm:py-16">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <Image
          src={FOUNDER_PHOTO_SRC}
          alt={t("photoAlt")}
          width={176}
          height={176}
          className="size-36 shrink-0 rounded-full object-cover sm:size-44"
          priority
        />
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("lead")}
          </p>
          <a
            href={LINKEDIN_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("linkedinLabel")}
          </a>
        </div>
      </div>

      <div className="mt-12 space-y-10">
        <section>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            {t("problemTitle")}
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            {t("problemBody")}
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            {t("solutionTitle")}
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            {t("solutionBody")}
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            {t("communityTitle")}
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            {t("communityBody")}
          </p>
        </section>
      </div>

      <div className="mt-12 border-t border-border pt-10">
        <Button size="lg" render={<Link href="/defects" />} nativeButton={false}>
          {t("ctaLabel")}
        </Button>
        <p className="mt-3 text-sm text-muted-foreground">{t("ctaHint")}</p>
      </div>
    </SiteShell>
  );
}
