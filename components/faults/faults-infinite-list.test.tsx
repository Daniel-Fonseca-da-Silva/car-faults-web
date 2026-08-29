import { render, screen } from "@testing-library/react";

import type { TopFaultEntry } from "@/types/vehicle";

import { FaultsInfiniteList } from "./faults-infinite-list";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("./fault-card-grid", () => ({
  FaultCardGrid: ({ entries }: { entries: TopFaultEntry[] }) => (
    <div data-testid="fault-card-grid">{entries.length}</div>
  ),
}));

const entry: TopFaultEntry = {
  id: "top-1",
  vehicle: {
    make: "Volkswagen",
    model: "Golf",
    year: 2015,
    engine: "1.6 TDI",
    fuelType: "diesel",
  },
  faultTitle: "Timing chain",
  severity: "high",
  reportCount: 412,
};

describe("FaultsInfiniteList", () => {
  it("renders the empty message when the first page has no items", () => {
    render(
      <FaultsInfiniteList
        initialItems={[]}
        initialCursor={null}
        query={{ locale: "pt-PT" }}
      />
    );

    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("renders the first page of faults", () => {
    render(
      <FaultsInfiniteList
        initialItems={[entry]}
        initialCursor={null}
        query={{ locale: "pt-PT" }}
      />
    );

    expect(screen.getByTestId("fault-card-grid")).toHaveTextContent("1");
  });
});
