import { render, screen } from "@testing-library/react";

import { StatsBar } from "./stats-bar";

const getPlatformStatsMock = jest.fn();

jest.mock("@/lib/api/platform", () => ({
  getPlatformStats: (...args: unknown[]) => getPlatformStatsMock(...args),
}));

jest.mock("next-intl/server", () => ({
  getLocale: async () => "en-GB",
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "home.stats.reports.label": "Owner reports",
      "home.stats.vehicles.label": "Vehicles catalogued",
      "home.stats.faults.label": "Documented faults",
    };
    return (key: string) => dict[`${namespace}.${key}`] ?? key;
  },
}));

describe("StatsBar", () => {
  afterEach(() => {
    getPlatformStatsMock.mockReset();
  });

  it("renders each stat formatted with locale grouping and a plus suffix, alongside its label", async () => {
    getPlatformStatsMock.mockResolvedValue({
      reportsCount: 1234567,
      vehiclesCount: 8400,
      faultsCount: 34000,
    });

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
