import { render, screen } from "@testing-library/react";

import type { UserStats } from "@/types/user-stats";

import { ProfileStatsGrid } from "./profile-stats-grid";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "profile.stats.searches": "Buscas realizadas",
      "profile.stats.defectsConsulted": "Defeitos consultados",
      "profile.stats.savedVehicles": "Os meus veículos",
      "profile.stats.favoritedVehicles": "Favoritos",
      "profile.stats.votes": "Votos dados",
    };
    return (key: string) => dict[`${namespace}.${key}`] ?? key;
  },
}));

const stats: UserStats = {
  searchesCount: 47,
  defectsConsultedCount: 128,
  savedVehiclesCount: 6,
  votesCount: 23,
  dislikesCount: 4,
  favoritedVehiclesCount: 2,
};

describe("ProfileStatsGrid", () => {
  it("renders the visible stat cards including favourited vehicles", async () => {
    const jsx = await ProfileStatsGrid({ stats });
    render(jsx);

    expect(screen.getByText("47")).toBeInTheDocument();
    expect(screen.getByText("Buscas realizadas")).toBeInTheDocument();
    expect(screen.getByText("128")).toBeInTheDocument();
    expect(screen.getByText("Defeitos consultados")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("Os meus veículos")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Favoritos")).toBeInTheDocument();
    expect(screen.getByText("23")).toBeInTheDocument();
    expect(screen.getByText("Votos dados")).toBeInTheDocument();
  });

  it("does not render the dislikes count", async () => {
    const jsx = await ProfileStatsGrid({ stats });
    render(jsx);

    expect(screen.queryByText("4")).not.toBeInTheDocument();
  });
});
