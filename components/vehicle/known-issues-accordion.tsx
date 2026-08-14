"use client";

import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IssueComments } from "@/components/vehicle/issue-comments";
import { IssueFixCard } from "@/components/vehicle/issue-fix-card";
import { IssueReviews } from "@/components/vehicle/issue-reviews";
import { IssueSources } from "@/components/vehicle/issue-sources";
import { SeverityBadge } from "@/components/vehicle/severity-badge";
import type { KnownIssue } from "@/types/lookup";
import type { UserProfile } from "@/types/user";

interface KnownIssuesAccordionProps {
  knownIssues: KnownIssue[];
  currentUser: UserProfile | null;
}

export function KnownIssuesAccordion({
  knownIssues,
  currentUser,
}: KnownIssuesAccordionProps) {
  const t = useTranslations("faults");

  return (
    <Accordion className="mt-4">
      {knownIssues.map((issue) => (
        <AccordionItem key={issue.id} value={issue.id}>
          <AccordionTrigger>
            <div className="flex flex-1 flex-wrap items-center justify-between gap-3 pr-3">
              <div>
                <p className="font-semibold text-foreground">{issue.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {issue.typicalKm != null &&
                    `${t("vehicle.atKm", { km: issue.typicalKm })} · `}
                  {t("vehicle.solutionsCount", { count: issue.fixes.length })}
                </p>
              </div>
              <SeverityBadge
                severity={issue.severity}
                label={t(`severity.${issue.severity}`)}
              />
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground">{issue.description}</p>

            <IssueSources sources={issue.sources} label={t("vehicle.sources")} />

            <IssueReviews
              knownIssueId={issue.id}
              currentUser={currentUser}
            />

            {issue.fixes.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  {t("vehicle.communitySolutions")}
                </p>
                {issue.fixes.map((fix) => (
                  <IssueFixCard
                    key={fix.id}
                    fix={fix}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}

            <IssueComments
              knownIssueId={issue.id}
              currentUser={currentUser}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
