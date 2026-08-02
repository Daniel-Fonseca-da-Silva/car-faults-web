import { render, screen } from "@testing-library/react";

import type { TopFaultEntry } from "@/types/vehicle";

import { TopFaultsSection } from "./top-faults-section";

const getTopFaultsMock = jest.fn();

jest.mock("@/lib/api/platform", () => ({
  getTopFaults: (...args: unknown[]) => getTopFaultsMock(...args),
}));

jest.mock("next-intl/server", () => ({
  getLocale: async () => "en-GB",
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "home.topFaults.title": "Most reported faults",
      "home.topFaults.subtitle":
        "The most common chronic issues reported this week.",
      "home.topFaults.empty": "No reported faults yet.",
    };
    return (key: string) => dict[`${namespace}.${key}`] ?? key;
  },
}));

jest.mock("@/components/faults/fault-card-grid", () => ({
  FaultCardGrid: ({ entries }: { entries: unknown[] }) => (
    <div data-testid="fault-card-grid">{entries.length}</div>
  ),
}));

const entries: TopFaultEntry[] = [
  {
    id: "top-1",
    vehicle: {
      makeSlug: "volkswagen",
      make: "Volkswagen",
      modelSlug: "golf",
      model: "Golf",
      year: 2015,
      engine: "1.6 TDI",
      fuelType: "diesel",
    },
    faultTitle: "Timing chain tensioner wear",
    severity: "high",
    reportCount: 412,
  },
];

describe("TopFaultsSection", () => {
  afterEach(() => {
    getTopFaultsMock.mockReset();
  });

  it("renders the heading and subtitle", async () => {
    getTopFaultsMock.mockResolvedValue(entries);

    const jsx = await TopFaultsSection();
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "Most reported faults" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("The most common chronic issues reported this week.")
    ).toBeInTheDocument();
  });

  it("passes the top fault entries to the fault card grid", async () => {
    getTopFaultsMock.mockResolvedValue(entries);

    const jsx = await TopFaultsSection();
    render(jsx);

    expect(screen.getByTestId("fault-card-grid")).toHaveTextContent(
      String(entries.length)
    );
  });

  it("fetches top faults for the current locale", async () => {
    getTopFaultsMock.mockResolvedValue(entries);

    await TopFaultsSection();

    expect(getTopFaultsMock).toHaveBeenCalledWith("en-GB");
  });

  it("renders an empty state message when there are no entries", async () => {
    getTopFaultsMock.mockResolvedValue([]);

    const jsx = await TopFaultsSection();
    render(jsx);

    expect(screen.getByText("No reported faults yet.")).toBeInTheDocument();
    expect(screen.queryByTestId("fault-card-grid")).not.toBeInTheDocument();
  });
});
