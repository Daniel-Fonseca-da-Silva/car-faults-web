import { render, screen } from "@testing-library/react";

import { StatsBar } from "./stats-bar";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "home.stats.reports.value": "1.2M+",
      "home.stats.reports.label": "Owner reports",
      "home.stats.vehicles.value": "8,400+",
      "home.stats.vehicles.label": "Vehicles catalogued",
      "home.stats.faults.value": "34,000+",
      "home.stats.faults.label": "Documented faults",
    };
    return (key: string) => dict[`${namespace}.${key}`] ?? key;
  },
}));

describe("StatsBar", () => {
  it("renders each stat value and label", async () => {
    const jsx = await StatsBar();
    render(jsx);

    expect(screen.getByText("1.2M+")).toBeInTheDocument();
    expect(screen.getByText("Owner reports")).toBeInTheDocument();
    expect(screen.getByText("8,400+")).toBeInTheDocument();
    expect(screen.getByText("Vehicles catalogued")).toBeInTheDocument();
    expect(screen.getByText("34,000+")).toBeInTheDocument();
    expect(screen.getByText("Documented faults")).toBeInTheDocument();
  });
});
