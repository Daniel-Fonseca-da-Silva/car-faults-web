"use client";

import { ChevronDown, ThumbsDown, ThumbsUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { useRouter } from "@/i18n/navigation";
import { removeFixVote, voteFix } from "@/lib/api/fixes";
import { cn } from "@/lib/utils";
import type { FixVote, IssueFix } from "@/types/lookup";
import type { UserProfile } from "@/types/user";

interface IssueFixCardProps {
  fix: IssueFix;
  currentUser: UserProfile | null;
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

export function IssueFixCard({ fix, currentUser }: IssueFixCardProps) {
  const t = useTranslations("faults");
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [likes, setLikes] = useState(fix.likes);
  const [dislikes, setDislikes] = useState(fix.dislikes);
  const [myVote, setMyVote] = useState<FixVote | null>(fix.myVote ?? null);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState(false);

  const cost = formatCostEur(fix.estimatedCostEur);

  async function handleVote(nextVote: FixVote) {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (voting) return;

    setVoting(true);
    setVoteError(false);

    try {
      if (myVote === nextVote) {
        await removeFixVote(fix.id);
        setMyVote(null);
        if (nextVote === "like") {
          setLikes((current) => current - 1);
        } else {
          setDislikes((current) => current - 1);
        }
      } else {
        const updated = await voteFix(fix.id, nextVote);
        setLikes(updated.likes);
        setDislikes(updated.dislikes);
        setMyVote(updated.myVote ?? null);
      }
    } catch {
      setVoteError(true);
    } finally {
      setVoting(false);
    }
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

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>{t("vehicle.helpful")}</span>
        <button
          type="button"
          onClick={() => handleVote("like")}
          aria-pressed={myVote === "like"}
          disabled={voting}
          className={cn(
            "flex items-center gap-1 rounded-full border border-border px-2 py-1 transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50",
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
          disabled={voting}
          className={cn(
            "flex items-center gap-1 rounded-full border border-border px-2 py-1 transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50",
            myVote === "dislike" && "border-primary text-primary"
          )}
        >
          <ThumbsDown aria-hidden="true" className="size-3.5" />
          {dislikes}
        </button>
        {!currentUser && (
          <span className="text-xs">{t("vehicle.loginToVote")}</span>
        )}
        {voteError && (
          <span className="text-xs text-destructive">
            {t("vehicle.voteError")}
          </span>
        )}
      </div>
    </div>
  );
}
