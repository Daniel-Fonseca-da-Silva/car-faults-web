import {
  BookmarkCheck,
  Search,
  TriangleAlert,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";

import { DemoVideo } from "./demo-video";

export const HOW_IT_WORKS_SECTION_ID = "how-it-works";

const DEMO_VIDEO_SRC = "/video/demo.mp4";
const DEMO_POSTER_SRC = "/video/demo.png";

const STEPS: readonly { key: string; icon: LucideIcon }[] = [
  { key: "search", icon: Search },
  { key: "faults", icon: TriangleAlert },
  { key: "fixes", icon: Wrench },
  { key: "save", icon: BookmarkCheck },
];

export async function HowItWorksSection() {
  const t = await getTranslations("home.howItWorks");

  return (
    <section
      id={HOW_IT_WORKS_SECTION_ID}
      aria-labelledby="how-it-works-title"
      className="relative mx-auto grid max-w-5xl scroll-mt-8 items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16"
    >
      <Reveal
        hoverLift
        className="relative mx-auto w-full max-w-xs sm:max-w-sm lg:order-first"
      >
        <div
          aria-hidden
          className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-chart-2/15 blur-3xl"
        />
        <div className="rounded-3xl border bg-card p-2 shadow-2xl ring-1 ring-primary/10">
          <DemoVideo
            src={DEMO_VIDEO_SRC}
            poster={DEMO_POSTER_SRC}
            width={1080}
            height={1920}
            label={t("videoLabel")}
            playLabel={t("playLabel")}
          />
        </div>
      </Reveal>

      <Stagger className="text-center lg:text-left">
        <StaggerItem>
          <Badge variant="outline" className="h-auto gap-1.5 px-3 py-1">
            <span aria-hidden className="size-1.5 rounded-full bg-primary" />
            {t("badge")}
          </Badge>
        </StaggerItem>
        <StaggerItem>
          <h2
            id="how-it-works-title"
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
        <StaggerItem>
          <ol className="mx-auto mt-8 flex max-w-md flex-col gap-3 text-left lg:mx-0">
            {STEPS.map(({ key, icon: Icon }, index) => (
              <li
                key={key}
                className="flex items-start gap-4 rounded-xl border bg-card p-4"
              >
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"
                >
                  <Icon className="size-4" />
                </span>
                <div>
                  <h3 className="font-heading text-sm font-semibold">
                    <span className="mr-1.5 text-primary">{index + 1}.</span>
                    {t(`steps.${key}.title`)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t(`steps.${key}.description`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </StaggerItem>
      </Stagger>
    </section>
  );
}
