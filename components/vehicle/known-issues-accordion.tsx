"use client";

import { useTranslations } from "next-intl";

import { useCurrentUser } from "@/components/auth/current-user-provider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AmazonPartsLink } from "@/components/vehicle/amazon-parts-link";
import { IssueComments } from "@/components/vehicle/issue-comments";
import { IssueFixCard } from "@/components/vehicle/issue-fix-card";
import { IssueReviews } from "@/components/vehicle/issue-reviews";
import { IssueSources } from "@/components/vehicle/issue-sources";
import { SeverityBadge } from "@/components/vehicle/severity-badge";
import type { AmazonStore } from "@/lib/affiliate/amazon";
import type { KnownIssue } from "@/types/lookup";

interface KnownIssuesAccordionProps {
  knownIssues: KnownIssue[];
  /** Prefix for the parts search (e.g. "SEAT León"); links show only with a store. */
  vehicleLabel?: string;
  amazonStore?: AmazonStore | null;
}

export function KnownIssuesAccordion({
  knownIssues,
  vehicleLabel,
  amazonStore,
}: KnownIssuesAccordionProps) {
  const t = useTranslations("faults");
  // Loaded in the browser: the page itself is shared by every visitor.
  const { user: currentUser } = useCurrentUser();

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

            {amazonStore && (
              <AmazonPartsLink
                store={amazonStore}
                query={[vehicleLabel, issue.title].filter(Boolean).join(" ")}
                label={t("vehicle.amazonParts.cta")}
                disclosure={t("vehicle.amazonParts.disclosure")}
              />
            )}

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
