import type { Metadata } from "next";
import {
  ArrowRight,
  ExternalLink,
  HeartHandshake,
  Lightbulb,
  TriangleAlert,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

import { SiteShell } from "@/components/layout/site-shell";
import {
  Reveal,
  ScaleIn,
  Stagger,
  StaggerItem,
} from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/locales";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

const LINKEDIN_PROFILE_URL =
  "https://www.linkedin.com/in/daniel-fonseca-da-silva/";
const FOUNDER_PHOTO_SRC = "/about/vw-1300-1973.webp";

const SECTIONS = [
  { key: "problem", icon: TriangleAlert },
  { key: "solution", icon: Lightbulb },
  { key: "community", icon: HeartHandshake },
] as const;

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
        <ScaleIn className="shrink-0">
          <Image
            src={FOUNDER_PHOTO_SRC}
            alt={t("photoAlt")}
            width={176}
            height={176}
            className="size-36 rounded-full object-cover sm:size-44"
            priority
          />
        </ScaleIn>
        <Stagger>
          <StaggerItem>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              {t("title")}
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("lead")}
            </p>
          </StaggerItem>
          <StaggerItem>
            <a
              href={LINKEDIN_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("linkedinLabel")}
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </StaggerItem>
        </Stagger>
      </div>

      <Stagger className="mt-12 space-y-10" stagger={0.15}>
        {SECTIONS.map(({ key, icon: Icon }) => (
          <StaggerItem key={key}>
            <section className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold tracking-tight">
                  {t(`${key}Title`)}
                </h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {t(`${key}Body`)}
                </p>
              </div>
            </section>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-12 border-t border-border pt-10">
        <Button
          size="lg"
          className="group"
          render={<Link href="/defects" />}
          nativeButton={false}
        >
          {t("ctaLabel")}
          <ArrowRight
            className="transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Button>
        <p className="mt-3 text-sm text-muted-foreground">{t("ctaHint")}</p>
      </Reveal>
    </SiteShell>
  );
}
