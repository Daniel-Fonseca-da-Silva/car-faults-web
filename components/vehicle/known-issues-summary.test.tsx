import { render, screen } from "@testing-library/react";

import { KnownIssuesSummary } from "./known-issues-summary";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "faults.vehicle.summaryBanner": "{count} defeitos conhecidos identificados",
      "faults.severity.low": "Baixa",
      "faults.severity.medium": "Média",
      "faults.severity.high": "Alta",
      "faults.severity.critical": "Crítica",
    };
    return (key: string, values?: Record<string, unknown>) => {
      const template = dict[`${namespace}.${key}`] ?? key;
      if (!values) return template;
      return Object.entries(values).reduce(
        (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
        template
      );
    };
  },
}));

describe("KnownIssuesSummary", () => {
  it("renders the total count and only the severities present, ordered by severity", async () => {
    const jsx = await KnownIssuesSummary({
      counts: { low: 1, medium: 0, high: 2, critical: 1 },
      total: 4,
    });
    render(jsx);

    expect(
      screen.getByText("4 defeitos conhecidos identificados")
    ).toBeInTheDocument();
    expect(screen.getByText("Crítica (1)")).toBeInTheDocument();
    expect(screen.getByText("Alta (2)")).toBeInTheDocument();
    expect(screen.getByText("Baixa (1)")).toBeInTheDocument();
    expect(screen.queryByText(/Média/)).not.toBeInTheDocument();
  });
});
