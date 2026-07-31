import type { KnownIssue } from "@/types/lookup";

import { countSeverities } from "./count-severities";

function knownIssue(severity: KnownIssue["severity"]): KnownIssue {
  return {
    id: `ki-${severity}`,
    title: "Title",
    description: "Description",
    severity,
    typicalKm: null,
    sources: null,
    fixes: [],
  };
}

describe("countSeverities", () => {
  it("returns zero counts for an empty list", () => {
    expect(countSeverities([])).toEqual({
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    });
  });

  it("tallies known issues by severity", () => {
    const knownIssues = [
      knownIssue("high"),
      knownIssue("high"),
      knownIssue("low"),
      knownIssue("critical"),
    ];

    expect(countSeverities(knownIssues)).toEqual({
      low: 1,
      medium: 0,
      high: 2,
      critical: 1,
    });
  });
});
