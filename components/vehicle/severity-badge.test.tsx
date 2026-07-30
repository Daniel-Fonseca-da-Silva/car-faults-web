import { render, screen } from "@testing-library/react";

import { SeverityBadge } from "./severity-badge";

describe("SeverityBadge", () => {
  it("renders the provided label", () => {
    render(<SeverityBadge severity="high" label="Alta (3)" />);

    expect(screen.getByText("Alta (3)")).toBeInTheDocument();
  });

  it("applies distinct styling per severity level", () => {
    const { rerender, container } = render(
      <SeverityBadge severity="medium" label="Média" />
    );
    expect(container.querySelector("span")?.className).toContain("amber");

    rerender(<SeverityBadge severity="high" label="Alta" />);
    expect(container.querySelector("span")?.className).toContain("orange");

    rerender(<SeverityBadge severity="critical" label="Crítica" />);
    expect(container.querySelector("span")?.className).toContain(
      "bg-destructive"
    );

    rerender(<SeverityBadge severity="low" label="Baixa" />);
    expect(container.querySelector("span")?.className).not.toContain(
      "bg-destructive"
    );
  });
});
