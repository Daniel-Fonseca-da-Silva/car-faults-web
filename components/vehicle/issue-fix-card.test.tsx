import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { IssueFix } from "@/types/lookup";

import { IssueFixCard } from "./issue-fix-card";

jest.mock("next-intl", () => ({
  useTranslations: () => {
    const dict: Record<string, string> = {
      "vehicle.estimatedCost": "Custo estimado",
      "vehicle.viewSteps": "Ver passo a passo",
      "vehicle.hideSteps": "Ocultar passo a passo",
      "vehicle.helpful": "Foi útil?",
    };
    return (key: string) => dict[key] ?? key;
  },
}));

const baseFix: IssueFix = {
  id: "fix-1",
  summary: "Replace gearbox synchros",
  steps: "Remove gearbox, replace synchro rings, reassemble.",
  estimatedCostEur: "450.00",
  source: "ai",
  likes: 12,
  dislikes: 3,
  myVote: null,
};

describe("IssueFixCard", () => {
  it("renders the summary and formatted cost", () => {
    render(<IssueFixCard fix={baseFix} />);

    expect(screen.getByText("Replace gearbox synchros")).toBeInTheDocument();
    expect(screen.getByText(/450€/)).toBeInTheDocument();
  });

  it("omits the cost badge when estimatedCostEur is null", () => {
    render(<IssueFixCard fix={{ ...baseFix, estimatedCostEur: null }} />);

    expect(screen.queryByText(/Custo estimado/)).not.toBeInTheDocument();
  });

  it("toggles the repair steps visibility", async () => {
    const user = userEvent.setup();
    render(<IssueFixCard fix={baseFix} />);

    expect(screen.queryByText(baseFix.steps)).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Ver passo a passo" })
    );
    expect(screen.getByText(baseFix.steps)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Ocultar passo a passo" })
    );
    expect(screen.queryByText(baseFix.steps)).not.toBeInTheDocument();
  });

  it("toggles votes locally without persisting anything", async () => {
    const user = userEvent.setup();
    render(<IssueFixCard fix={baseFix} />);

    await user.click(screen.getByRole("button", { name: "12" }));
    expect(screen.getByRole("button", { name: "13" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "3" }));
    expect(screen.getByRole("button", { name: "12" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
  });
});
