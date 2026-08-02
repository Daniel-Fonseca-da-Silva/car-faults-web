import { render, screen } from "@testing-library/react";

import type { TopFaultEntry } from "@/types/vehicle";

import { FaultCardGrid } from "./fault-card-grid";

jest.mock("./fault-card", () => ({
  FaultCard: ({ faultTitle }: { faultTitle: string }) => (
    <div data-testid="fault-card">{faultTitle}</div>
  ),
}));

const entries: TopFaultEntry[] = [
  {
    id: "a",
    vehicle: {
      makeSlug: "volkswagen",
      make: "Volkswagen",
      modelSlug: "golf",
      model: "Golf",
      year: 2018,
      engine: "2.0 TDI",
      fuelType: "diesel",
    },
    faultTitle: "Timing chain tensioner wear",
    severity: "high",
    reportCount: 412,
  },
  {
    id: "b",
    vehicle: {
      makeSlug: "bmw",
      make: "BMW",
      modelSlug: "serie-3",
      model: "Série 3",
      year: 2016,
      engine: "320d",
      fuelType: "diesel",
    },
    faultTitle: "Timing chain and guide wear",
    severity: "critical",
    reportCount: 387,
  },
];

describe("FaultCardGrid", () => {
  it("renders a fault card for each entry", () => {
    render(<FaultCardGrid entries={entries} />);

    const cards = screen.getAllByTestId("fault-card");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("Timing chain tensioner wear");
    expect(cards[1]).toHaveTextContent("Timing chain and guide wear");
  });

  it("renders no cards when there are no entries", () => {
    render(<FaultCardGrid entries={[]} />);

    expect(screen.queryByTestId("fault-card")).not.toBeInTheDocument();
  });
});
