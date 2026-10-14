import {
  ArrowRight,
  Check,
  Clock,
  ShieldCheck,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const PROBLEM_KEYS = [
  "scattered",
  "tooLate",
  "sellerWord",
  "surpriseRepairs",
] as const;

const SOLUTION_KEYS = ["oneSearch", "severity", "fixes", "aiFlagged"] as const;

type Translator = Awaited<ReturnType<typeof getTranslations>>;

interface ComparisonCardProps {
  t: Translator;
  variant: "problem" | "solution";
  keys: readonly string[];
}

const VARIANTS: Record<
  ComparisonCardProps["variant"],
  {
    headerIcon: LucideIcon;
    itemIcon: LucideIcon;
    cardClassName: string;
    headerClassName: string;
    iconBoxClassName: string;
    subtitleClassName: string;
    bulletClassName: string;
  }
> = {
  problem: {
    headerIcon: Clock,
    itemIcon: X,
    cardClassName: "border-destructive/20",
    headerClassName: "border-destructive/20 bg-destructive/10",
    iconBoxClassName: "bg-destructive/15 text-destructive",
    subtitleClassName: "text-destructive/80",
    bulletClassName: "bg-destructive/15 text-destructive",
  },
  solution: {
    headerIcon: Zap,
    itemIcon: Check,
    cardClassName:
      "border-primary/30 shadow-lg shadow-primary/15 ring-1 ring-primary/10",
    headerClassName:
      "border-primary/20 bg-linear-to-r from-primary/15 to-chart-2/10",
    iconBoxClassName: "bg-primary/15 text-primary",
    subtitleClassName: "text-primary",
    bulletClassName: "bg-success/15 text-success",
  },
};

const ComparisonCard = ({ t, variant, keys }: ComparisonCardProps) => {
  const styles = VARIANTS[variant];
  const HeaderIcon = styles.headerIcon;
  const ItemIcon = styles.itemIcon;
  const titleId = `problem-solution-${variant}-title`;

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "h-full overflow-hidden rounded-2xl border bg-card",
        styles.cardClassName
      )}
    >
      <header
        className={cn("flex items-center gap-3 border-b p-4", styles.headerClassName)}
      >
        <span
          aria-hidden
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            styles.iconBoxClassName
          )}
        >
          <HeaderIcon className="size-4" />
        </span>
        <div className="text-left">
          <h3 id={titleId} className="font-heading text-base font-semibold">
            {t(`${variant}.title`)}
          </h3>
          <p className={cn("text-xs", styles.subtitleClassName)}>
            {t(`${variant}.subtitle`)}
          </p>
        </div>
      </header>
      <ul className="flex flex-col gap-3 p-4">
        {keys.map((key) => (
          <li
            key={key}
            className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3 text-left text-sm leading-relaxed"
          >
            <span
              aria-hidden
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                styles.bulletClassName
              )}
            >
              <ItemIcon className="size-3" />
            </span>
            {t(`${variant}.items.${key}`)}
          </li>
        ))}
      </ul>
    </article>
  );
};

export async function ProblemSolutionSection() {
  const t = await getTranslations("home.problemSolution");

  return (
    <section
      aria-labelledby="problem-solution-title"
      className="mx-auto max-w-5xl py-16 text-center"
    >
      <Stagger>
        <StaggerItem>
          <h2
            id="problem-solution-title"
            className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl"
          >
            {t("titleLead")}{" "}
            <span className="bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              {t("titleHighlight")}
            </span>
          </h2>
        </StaggerItem>
        <StaggerItem>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
        </StaggerItem>
      </Stagger>

      <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-0">
        <Reveal>
          <ComparisonCard t={t} variant="problem" keys={PROBLEM_KEYS} />
        </Reveal>
        <div className="flex items-center justify-center lg:-mx-5 lg:z-10">
          <span
            role="img"
            aria-label={t("transitionLabel")}
            className="flex size-11 items-center justify-center rounded-full border bg-background text-primary shadow-md"
          >
            <ArrowRight aria-hidden className="size-4 rotate-90 lg:rotate-0" />
          </span>
        </div>
        <Reveal delay={0.15}>
          <ComparisonCard t={t} variant="solution" keys={SOLUTION_KEYS} />
        </Reveal>
      </div>

      <Reveal delay={0.25} hoverLift className="mx-auto mt-6 max-w-2xl">
        <div className="rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 via-card to-chart-2/10 px-6 py-8">
          <span
            aria-hidden
            className="mx-auto flex size-10 items-center justify-center rounded-lg bg-success/15 text-success"
          >
            <ShieldCheck className="size-5" />
          </span>
          <p className="mt-4 bg-linear-to-r from-primary to-chart-2 bg-clip-text font-heading text-2xl font-bold text-transparent sm:text-3xl">
            {t("highlight.title")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("highlight.subtitle")}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
