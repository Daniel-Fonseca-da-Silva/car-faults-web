import { render, screen } from "@testing-library/react";

import { topFaults } from "@/lib/mocks/top-faults";

import { TopFaultsSection } from "./top-faults-section";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "home.topFaults.title": "Most reported faults",
      "home.topFaults.subtitle":
        "The most common chronic issues reported this week.",
    };
    return (key: string) => dict[`${namespace}.${key}`] ?? key;
  },
}));

jest.mock("@/components/faults/fault-card-grid", () => ({
  FaultCardGrid: ({ entries }: { entries: unknown[] }) => (
    <div data-testid="fault-card-grid">{entries.length}</div>
  ),
}));

describe("TopFaultsSection", () => {
  it("renders the heading and subtitle", async () => {
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
    const jsx = await TopFaultsSection();
    render(jsx);

    expect(screen.getByTestId("fault-card-grid")).toHaveTextContent(
      String(topFaults.length)
    );
  });
});
