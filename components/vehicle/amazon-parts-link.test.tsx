import { render, screen } from "@testing-library/react";

import { AmazonPartsLink } from "./amazon-parts-link";

describe("AmazonPartsLink", () => {
  it("renders a sponsored Amazon search link with the affiliate tag", () => {
    render(
      <AmazonPartsLink
        store={{ domain: "www.amazon.es", tag: "autocronica17-21" }}
        query="SEAT León bomba"
        label="Ver peças na Amazon"
        disclosure="Link de afiliado"
      />
    );

    const link = screen.getByRole("link", { name: "Ver peças na Amazon" });
    expect(link).toHaveAttribute(
      "href",
      "https://www.amazon.es/s?k=SEAT+Le%C3%B3n+bomba&tag=autocronica17-21"
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("sponsored");
    expect(screen.getByText("Link de afiliado")).toBeInTheDocument();
  });
});
