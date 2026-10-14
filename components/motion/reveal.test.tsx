import { render, screen } from "@testing-library/react";

import { Reveal, ScaleIn, Stagger, StaggerItem } from "./reveal";

describe("Reveal", () => {
  it("renders its children inside a wrapper with the given class", () => {
    render(
      <Reveal className="mt-6" delay={0.2} hoverLift>
        <p>Garage</p>
      </Reveal>
    );

    expect(screen.getByText("Garage").parentElement).toHaveClass("mt-6");
  });

  it("renders without a delay or hover lift", () => {
    render(
      <Reveal>
        <p>Profile</p>
      </Reveal>
    );

    expect(screen.getByText("Profile")).toBeInTheDocument();
  });
});

describe("Stagger", () => {
  it("renders every item inside the group", () => {
    render(
      <Stagger className="grid" stagger={0.05}>
        <StaggerItem hoverLift>
          <p>First</p>
        </StaggerItem>
        <StaggerItem className="item">
          <p>Second</p>
        </StaggerItem>
      </Stagger>
    );

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second").parentElement).toHaveClass("item");
  });
});

describe("ScaleIn", () => {
  it("renders its children", () => {
    render(
      <ScaleIn className="badge">
        <span>Saved</span>
      </ScaleIn>
    );

    expect(screen.getByText("Saved").parentElement).toHaveClass("badge");
  });
});
