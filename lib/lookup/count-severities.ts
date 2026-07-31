import type { IssueSeverity, KnownIssue } from "@/types/lookup";

export function countSeverities(
  knownIssues: KnownIssue[]
): Record<IssueSeverity, number> {
  const counts: Record<IssueSeverity, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  for (const knownIssue of knownIssues) {
    counts[knownIssue.severity] += 1;
  }

  return counts;
}
