import { render, screen } from "@testing-library/react";

import AdminLayout, { dynamic } from "./layout";

describe("AdminLayout", () => {
  it("forces dynamic rendering to avoid DYNAMIC_SERVER_USAGE on admin routes", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("renders its children", () => {
    render(<>{AdminLayout({ children: <p>admin content</p> })}</>);

    expect(screen.getByText("admin content")).toBeInTheDocument();
  });
});
