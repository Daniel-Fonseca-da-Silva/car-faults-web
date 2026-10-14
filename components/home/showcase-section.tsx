import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

import { HOW_IT_WORKS_SECTION_ID } from "./how-it-works-section";
import { ScrollLink } from "./scroll-link";

const SHOWCASE_IMAGE_SRC = "/banner-home.png";

const FEATURES = [
  { key: "ownerReports", dotClassName: "bg-success" },
  { key: "aiAnalysis", dotClassName: "bg-primary" },
  { key: "garage", dotClassName: "bg-chart-2" },
] as const;

export async function ShowcaseSection() {
  const t = await getTranslations("home.showcase");

  return (
    <section
      aria-labelledby="showcase-title"
      className="relative mx-auto grid max-w-5xl items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16"
    >
      <Stagger className="text-center lg:text-left">
        <StaggerItem>
          <Badge variant="outline" className="h-auto gap-1.5 px-3 py-1">
            <Sparkles aria-hidden className="text-primary" />
            {t("badge")}
          </Badge>
        </StaggerItem>
        <StaggerItem>
          <h2
            id="showcase-title"
            className="mt-5 font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl"
          >
            <span className="block">{t("titleLead")}</span>
            <span className="block bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              {t("titleHighlight")}
            </span>
          </h2>
        </StaggerItem>
        <StaggerItem>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
            {t("subtitle")}
          </p>
        </StaggerItem>
        <StaggerItem className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
          <Button
            render={<Link href="/defects" />}
            nativeButton={false}
            size="lg"
            className="h-11 px-5 shadow-lg shadow-primary/30"
          >
            {t("primaryCta")}
            <ArrowRight aria-hidden data-icon="inline-end" />
          </Button>
          <Button
            render={<ScrollLink targetId={HOW_IT_WORKS_SECTION_ID} />}
            nativeButton={false}
            size="lg"
            variant="outline"
            className="h-11 px-5"
          >
            <BookOpen aria-hidden data-icon="inline-start" />
            {t("secondaryCta")}
          </Button>
        </StaggerItem>
        <StaggerItem>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground lg:justify-start">
            {FEATURES.map(({ key, dotClassName }) => (
              <li key={key} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={`size-1.5 rounded-full ${dotClassName}`}
                />
                {t(`features.${key}`)}
              </li>
            ))}
          </ul>
        </StaggerItem>
      </Stagger>

      <Reveal
        delay={0.15}
        hoverLift
        className="relative mx-auto w-full max-w-xs sm:max-w-sm"
      >
        <div
          aria-hidden
          className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary/15 blur-3xl"
        />
        <div className="rounded-3xl border bg-card p-2 shadow-2xl ring-1 ring-primary/10">
          <Image
            src={SHOWCASE_IMAGE_SRC}
            alt={t("imageAlt")}
            width={1074}
            height={1812}
            sizes="(min-width: 640px) 384px, 320px"
            className="h-auto w-full rounded-2xl"
          />
        </div>
      </Reveal>
    </section>
  );
}
