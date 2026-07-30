"use client";

import { ChevronDown, ThumbsDown, ThumbsUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FixVote, IssueFix } from "@/types/lookup";

interface IssueFixCardProps {
  fix: IssueFix;
}

function formatCostEur(
  estimatedCostEur: IssueFix["estimatedCostEur"]
): string | null {
  if (estimatedCostEur === null || estimatedCostEur === undefined) return null;
  const value =
    typeof estimatedCostEur === "string"
      ? Number(estimatedCostEur)
      : estimatedCostEur;
  if (Number.isNaN(value)) return null;
  return `${value}€`;
}

export function IssueFixCard({ fix }: IssueFixCardProps) {
  const t = useTranslations("faults");
  const [expanded, setExpanded] = useState(false);
  const [myVote, setMyVote] = useState<FixVote | null>(fix.myVote ?? null);

  const cost = formatCostEur(fix.estimatedCostEur);
  const likes = fix.likes + (myVote === "like" ? 1 : 0);
  const dislikes = fix.dislikes + (myVote === "dislike" ? 1 : 0);

  function handleVote(nextVote: FixVote) {
    setMyVote((currentVote) => (currentVote === nextVote ? null : nextVote));
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{fix.summary}</p>
        {cost && (
          <Badge variant="outline" className="shrink-0">
            {t("vehicle.estimatedCost")}: {cost}
          </Badge>
        )}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="mt-3 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        {expanded ? t("vehicle.hideSteps") : t("vehicle.viewSteps")}
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 transition-transform", expanded && "rotate-180")}
        />
      </button>

      {expanded && (
        <p className="mt-3 text-sm text-muted-foreground">{fix.steps}</p>
      )}

      <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
        <span>{t("vehicle.helpful")}</span>
        <button
          type="button"
          onClick={() => handleVote("like")}
          aria-pressed={myVote === "like"}
          className={cn(
            "flex items-center gap-1 rounded-full border border-border px-2 py-1 transition-colors hover:border-primary hover:text-primary",
            myVote === "like" && "border-primary text-primary"
          )}
        >
          <ThumbsUp aria-hidden="true" className="size-3.5" />
          {likes}
        </button>
        <button
          type="button"
          onClick={() => handleVote("dislike")}
          aria-pressed={myVote === "dislike"}
          className={cn(
            "flex items-center gap-1 rounded-full border border-border px-2 py-1 transition-colors hover:border-primary hover:text-primary",
            myVote === "dislike" && "border-primary text-primary"
          )}
        >
          <ThumbsDown aria-hidden="true" className="size-3.5" />
          {dislikes}
        </button>
      </div>
    </div>
  );
}
