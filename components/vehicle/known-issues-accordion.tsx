"use client";

import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IssueFixCard } from "@/components/vehicle/issue-fix-card";
import { SeverityBadge } from "@/components/vehicle/severity-badge";
import type { KnownIssue } from "@/types/lookup";

interface KnownIssuesAccordionProps {
  knownIssues: KnownIssue[];
}

export function KnownIssuesAccordion({
  knownIssues,
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

            {issue.sources && issue.sources.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {t("vehicle.sources")}: {issue.sources.join(", ")}
              </p>
            )}

            {issue.fixes.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  {t("vehicle.communitySolutions")}
                </p>
                {issue.fixes.map((fix) => (
                  <IssueFixCard key={fix.id} fix={fix} />
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
