import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { KnownIssue } from "@/types/lookup";

import { KnownIssuesAccordion } from "./known-issues-accordion";

jest.mock("next-intl", () => ({
  useTranslations: () => {
    const dict: Record<string, string> = {
      "severity.high": "Alta",
      "severity.low": "Baixa",
      "vehicle.atKm": "aos {km} km",
      "vehicle.solutionsCount": "{count} soluções",
      "vehicle.sources": "Fontes",
      "vehicle.communitySolutions": "Soluções da comunidade",
      "vehicle.estimatedCost": "Custo estimado",
      "vehicle.viewSteps": "Ver passo a passo",
      "vehicle.hideSteps": "Ocultar passo a passo",
      "vehicle.helpful": "Foi útil?",
    };
    return (key: string, values?: Record<string, unknown>) => {
      const template = dict[key] ?? key;
      if (!values) return template;
      return Object.entries(values).reduce(
        (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
        template
      );
    };
  },
}));

const knownIssues: KnownIssue[] = [
  {
    id: "issue-1",
    title: "Problematic gearbox",
    description: "Synchros wear out prematurely.",
    severity: "high",
    typicalKm: 120000,
    sources: ["https://example.com/source"],
    fixes: [
      {
        id: "fix-1",
        summary: "Replace gearbox synchros",
        steps: "Remove gearbox, replace synchros, reassemble.",
        estimatedCostEur: "450.00",
        source: "ai",
        likes: 12,
        dislikes: 3,
        myVote: null,
      },
    ],
  },
  {
    id: "issue-2",
    title: "Minor electrical fault",
    description: "Occasional dashboard flicker.",
    severity: "low",
    typicalKm: null,
    sources: null,
    fixes: [],
  },
];

function clickTrigger(title: string) {
  const trigger = screen.getByText(title).closest("button");
  if (!trigger) throw new Error(`No accordion trigger found for "${title}"`);
  return trigger;
}

describe("KnownIssuesAccordion", () => {
  it("lists every known issue with its severity and solution count", () => {
    render(<KnownIssuesAccordion knownIssues={knownIssues} />);

    expect(screen.getByText("Problematic gearbox")).toBeInTheDocument();
    expect(screen.getByText("Minor electrical fault")).toBeInTheDocument();
    expect(screen.getByText("Alta")).toBeInTheDocument();
    expect(screen.getByText("Baixa")).toBeInTheDocument();
    expect(screen.getByText(/1 soluções/)).toBeInTheDocument();
    expect(screen.getByText(/0 soluções/)).toBeInTheDocument();
  });

  it("reveals the description, sources and fix cards once expanded", async () => {
    const user = userEvent.setup();
    render(<KnownIssuesAccordion knownIssues={knownIssues} />);

    expect(
      screen.queryByText("Synchros wear out prematurely.")
    ).not.toBeInTheDocument();

    await user.click(clickTrigger("Problematic gearbox"));

    expect(
      screen.getByText("Synchros wear out prematurely.")
    ).toBeInTheDocument();
    expect(screen.getByText(/Fontes:/)).toBeInTheDocument();
    expect(screen.getByText("Replace gearbox synchros")).toBeInTheDocument();
  });

  it("does not render a community solutions section when there are no fixes", async () => {
    const user = userEvent.setup();
    render(<KnownIssuesAccordion knownIssues={knownIssues} />);

    await user.click(clickTrigger("Minor electrical fault"));

    expect(
      screen.queryByText("Soluções da comunidade")
    ).not.toBeInTheDocument();
  });
});
