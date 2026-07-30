import { getTranslations } from "next-intl/server";

import { SeverityBadge } from "@/components/vehicle/severity-badge";
import type { IssueSeverity } from "@/types/lookup";

const SEVERITY_ORDER: IssueSeverity[] = ["critical", "high", "medium", "low"];

interface KnownIssuesSummaryProps {
  counts: Record<IssueSeverity, number>;
  total: number;
}

export async function KnownIssuesSummary({
  counts,
  total,
}: KnownIssuesSummaryProps) {
  const t = await getTranslations("faults");

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
      <p className="text-sm font-medium text-foreground">
        {t("vehicle.summaryBanner", { count: total })}
      </p>
      <div className="flex flex-wrap gap-2">
        {SEVERITY_ORDER.filter((severity) => counts[severity] > 0).map(
          (severity) => (
            <SeverityBadge
              key={severity}
              severity={severity}
              label={`${t(`severity.${severity}`)} (${counts[severity]})`}
            />
          )
        )}
      </div>
    </div>
  );
}
