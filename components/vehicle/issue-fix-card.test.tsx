import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { IssueFix } from "@/types/lookup";
import type { UserProfile } from "@/types/user";

import { IssueFixCard } from "./issue-fix-card";

const voteFixMock = jest.fn();
const removeFixVoteMock = jest.fn();
const pushMock = jest.fn();

jest.mock("@/lib/api/fixes", () => ({
  voteFix: (...args: unknown[]) => voteFixMock(...args),
  removeFixVote: (...args: unknown[]) => removeFixVoteMock(...args),
}));

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => {
    const dict: Record<string, string> = {
      "vehicle.estimatedCost": "Custo estimado",
      "vehicle.viewSteps": "Ver passo a passo",
      "vehicle.hideSteps": "Ocultar passo a passo",
      "vehicle.helpful": "Foi útil?",
      "vehicle.loginToVote": "Inicia sessão para votar",
      "vehicle.voteError": "Não foi possível registar o voto.",
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

const currentUser: UserProfile = {
  id: "user-1",
  email: "ana@example.com",
  name: "Ana Silva",
  role: "user",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("IssueFixCard", () => {
  afterEach(() => {
    voteFixMock.mockReset();
    removeFixVoteMock.mockReset();
    pushMock.mockReset();
  });

  it("renders the summary and formatted cost", () => {
    render(<IssueFixCard fix={baseFix} currentUser={null} />);

    expect(screen.getByText("Replace gearbox synchros")).toBeInTheDocument();
    expect(screen.getByText(/450€/)).toBeInTheDocument();
  });

  it("omits the cost badge when estimatedCostEur is null", () => {
    render(
      <IssueFixCard
        fix={{ ...baseFix, estimatedCostEur: null }}
        currentUser={null}
      />
    );

    expect(screen.queryByText(/Custo estimado/)).not.toBeInTheDocument();
  });

  it("toggles the repair steps visibility", async () => {
    const user = userEvent.setup();
    render(<IssueFixCard fix={baseFix} currentUser={null} />);

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

  it("shows a login hint and sends a guest to login without calling the API", async () => {
    const user = userEvent.setup();
    render(<IssueFixCard fix={baseFix} currentUser={null} />);

    expect(screen.getByText("Inicia sessão para votar")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "12" }));

    expect(pushMock).toHaveBeenCalledWith("/login");
    expect(voteFixMock).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "12" })).toBeInTheDocument();
  });

  it("calls voteFix and applies the returned counts for a logged-in user", async () => {
    const user = userEvent.setup();
    voteFixMock.mockResolvedValue({
      likes: 13,
      dislikes: 3,
      myVote: "like",
    });
    render(<IssueFixCard fix={baseFix} currentUser={currentUser} />);

    await user.click(screen.getByRole("button", { name: "12" }));

    await waitFor(() => {
      expect(voteFixMock).toHaveBeenCalledWith("fix-1", "like");
    });
    expect(await screen.findByRole("button", { name: "13" })).toBeInTheDocument();
  });

  it("removes the vote and decrements locally when clicking an active vote again", async () => {
    const user = userEvent.setup();
    removeFixVoteMock.mockResolvedValue(undefined);
    render(
      <IssueFixCard
        fix={{ ...baseFix, myVote: "like" }}
        currentUser={currentUser}
      />
    );

    await user.click(screen.getByRole("button", { name: "12" }));

    await waitFor(() => {
      expect(removeFixVoteMock).toHaveBeenCalledWith("fix-1");
    });
    expect(await screen.findByRole("button", { name: "11" })).toBeInTheDocument();
  });

  it("shows an inline error when the vote request fails", async () => {
    const user = userEvent.setup();
    voteFixMock.mockRejectedValue(new Error("network error"));
    render(<IssueFixCard fix={baseFix} currentUser={currentUser} />);

    await user.click(screen.getByRole("button", { name: "12" }));

    expect(
      await screen.findByText("Não foi possível registar o voto.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "12" })).toBeInTheDocument();
  });
});
