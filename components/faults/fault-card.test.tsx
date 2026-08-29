import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { FaultCard } from "./fault-card";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    const dict: Record<string, string> = {
      "severity.low": "Low",
      "severity.medium": "Medium",
      "severity.high": "High",
      "severity.critical": "Critical",
      viewReports: "View reports",
    };
    if (key === "reportsCount") {
      return `${values?.count} reports`;
    }
    return dict[key] ?? key;
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

const baseProps = {
  make: "Volkswagen",
  model: "Golf",
  year: 2018,
  engine: "2.0 TDI",
  faultTitle: "Timing chain tensioner wear",
  severity: "high" as const,
  reportCount: 412,
};

describe("FaultCard", () => {
  it("renders vehicle info, fault title, severity and report count", () => {
    render(<FaultCard {...baseProps} fuelType="diesel" />);

    expect(screen.getByText("Volkswagen Golf · 2018")).toBeInTheDocument();
    expect(
      screen.getByText("Timing chain tensioner wear")
    ).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("412 reports")).toBeInTheDocument();
  });

  it("links to the vehicle's pSEO page with fuel type and engine in the path", () => {
    render(<FaultCard {...baseProps} fuelType="diesel" doors={5} />);

    const link = screen.getByRole("link", { name: /View reports/i });
    expect(link).toHaveAttribute(
      "href",
      "/defects/volkswagen/golf/2018/diesel/2-0-tdi?doors=5"
    );
  });

  it("renders a non-interactive CTA instead of a link when the vehicle has no fuel type on record", () => {
    render(<FaultCard {...baseProps} />);

    expect(
      screen.queryByRole("link", { name: /View reports/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText("View reports")).toBeInTheDocument();
  });

  it("uses the warning icon for non-critical severities", () => {
    render(
      <FaultCard
        make="Renault"
        model="Clio"
        year={2019}
        engine="0.9 TCe"
        fuelType="gasoline"
        faultTitle="EDC dual-clutch jerking"
        severity="medium"
        reportCount={231}
      />
    );

    expect(screen.getByText("Medium")).toBeInTheDocument();
  });
});
