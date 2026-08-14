import { render, screen } from "@testing-library/react";

import { IssueSources } from "./issue-sources";

describe("IssueSources", () => {
  it("renders a clickable link with target and rel for an http(s) source", () => {
    render(
      <IssueSources
        label="Fontes"
        sources={["https://www.auto-doc.pt/info/volkswagen-polo-problemas-associados"]}
      />
    );

    const link = screen.getByRole("link", { name: "auto-doc.pt" });
    expect(link).toHaveAttribute(
      "href",
      "https://www.auto-doc.pt/info/volkswagen-polo-problemas-associados"
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders prose sources as plain text without a link role", () => {
    render(<IssueSources label="Fontes" sources={["VW owner forums"]} />);

    expect(screen.getByText("VW owner forums")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the label followed by comma-separated sources", () => {
    const { container } = render(
      <IssueSources
        label="Fontes"
        sources={["VW owner forums", "https://example.com"]}
      />
    );

    expect(container.textContent).toBe("Fontes: VW owner forums, example.com");
  });

  it("renders nothing when sources is null", () => {
    const { container } = render(<IssueSources label="Fontes" sources={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when sources is an empty array", () => {
    const { container } = render(<IssueSources label="Fontes" sources={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
