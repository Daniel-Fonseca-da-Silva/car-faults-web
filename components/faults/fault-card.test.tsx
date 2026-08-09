import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { FaultCard } from "./fault-card";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "faults.severity.low": "Low",
      "faults.severity.medium": "Medium",
      "faults.severity.high": "High",
      "faults.severity.critical": "Critical",
      "faults.viewReports": "View reports",
    };
    return (key: string, values?: Record<string, unknown>) => {
      if (key === "reportsCount") {
        return `${values?.count} reports`;
      }
      return dict[`${namespace}.${key}`] ?? key;
    };
  },
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("FaultCard", () => {
  it("renders vehicle info, fault title, severity and report count", async () => {
    const jsx = await FaultCard({
      make: "Volkswagen",
      model: "Golf",
      year: 2018,
      engine: "2.0 TDI",
      fuelType: "diesel",
      faultTitle: "Timing chain tensioner wear",
      severity: "high",
      reportCount: 412,
    });

    render(jsx);

    expect(screen.getByText("Volkswagen Golf · 2018")).toBeInTheDocument();
    expect(
      screen.getByText("Timing chain tensioner wear")
    ).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("412 reports")).toBeInTheDocument();
  });

  it("links to the vehicle's pSEO page with fuel type and engine in the path", async () => {
    const jsx = await FaultCard({
      make: "Volkswagen",
      model: "Golf",
      year: 2018,
      engine: "2.0 TDI",
      fuelType: "diesel",
      doors: 5,
      faultTitle: "Timing chain tensioner wear",
      severity: "high",
      reportCount: 412,
    });

    render(jsx);

    const link = screen.getByRole("link", { name: /View reports/i });
    expect(link).toHaveAttribute(
      "href",
      "/defects/volkswagen/golf/2018/diesel/2-0-tdi?doors=5"
    );
  });

  it("renders a non-interactive CTA instead of a link when the vehicle has no fuel type on record", async () => {
    const jsx = await FaultCard({
      make: "Volkswagen",
      model: "Golf",
      year: 2018,
      engine: "2.0 TDI",
      faultTitle: "Timing chain tensioner wear",
      severity: "high",
      reportCount: 412,
    });

    render(jsx);

    expect(
      screen.queryByRole("link", { name: /View reports/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText("View reports")).toBeInTheDocument();
  });

  it("uses the warning icon for non-critical severities", async () => {
    const jsx = await FaultCard({
      make: "Renault",
      model: "Clio",
      year: 2019,
      engine: "0.9 TCe",
      fuelType: "gasoline",
      faultTitle: "EDC dual-clutch jerking",
      severity: "medium",
      reportCount: 231,
    });

    render(jsx);

    expect(screen.getByText("Medium")).toBeInTheDocument();
  });
});
