import { render, screen, within } from "@testing-library/react";

import { ProblemSolutionSection } from "./problem-solution-section";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    return (key: string) => `${namespace}.${key}`;
  },
}));

const NS = "home.problemSolution";

describe("ProblemSolutionSection", () => {
  it("renders the heading with its highlight and the subtitle", async () => {
    render(await ProblemSolutionSection());

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      `${NS}.titleLead ${NS}.titleHighlight`
    );
    expect(screen.getByText(`${NS}.subtitle`)).toBeInTheDocument();
  });

  it("lists every pain point inside the problem card", async () => {
    render(await ProblemSolutionSection());

    const card = screen.getByRole("article", { name: `${NS}.problem.title` });
    expect(within(card).getByText(`${NS}.problem.subtitle`)).toBeInTheDocument();
    expect(
      within(card)
        .getAllByRole("listitem")
        .map((item) => item.textContent)
    ).toEqual([
      `${NS}.problem.items.scattered`,
      `${NS}.problem.items.tooLate`,
      `${NS}.problem.items.sellerWord`,
      `${NS}.problem.items.surpriseRepairs`,
    ]);
  });

  it("lists every benefit inside the solution card", async () => {
    render(await ProblemSolutionSection());

    const card = screen.getByRole("article", { name: `${NS}.solution.title` });
    expect(within(card).getByText(`${NS}.solution.subtitle`)).toBeInTheDocument();
    expect(
      within(card)
        .getAllByRole("listitem")
        .map((item) => item.textContent)
    ).toEqual([
      `${NS}.solution.items.oneSearch`,
      `${NS}.solution.items.severity`,
      `${NS}.solution.items.fixes`,
      `${NS}.solution.items.aiFlagged`,
    ]);
  });

  it("labels the transition arrow and renders the highlight card", async () => {
    render(await ProblemSolutionSection());

    expect(
      screen.getByRole("img", { name: `${NS}.transitionLabel` })
    ).toBeInTheDocument();
    expect(screen.getByText(`${NS}.highlight.title`)).toBeInTheDocument();
    expect(screen.getByText(`${NS}.highlight.subtitle`)).toBeInTheDocument();
  });
});
