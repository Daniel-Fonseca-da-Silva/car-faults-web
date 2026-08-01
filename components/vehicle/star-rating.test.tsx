import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { StarRating } from "./star-rating";

describe("StarRating", () => {
  it("renders as a display-only image when there is no onChange handler", () => {
    render(<StarRating value={4.3} />);

    const rating = screen.getByRole("img", { name: "4.3 / 5" });
    expect(rating).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("renders as interactive radio stars when onChange is provided", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<StarRating value={0} onChange={onChange} label="Rating" />);

    const stars = screen.getAllByRole("radio");
    expect(stars).toHaveLength(5);

    await user.click(screen.getByRole("radio", { name: "4 / 5" }));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("marks the star matching the current value as checked", () => {
    render(<StarRating value={3} onChange={jest.fn()} />);

    expect(screen.getByRole("radio", { name: "3 / 5" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByRole("radio", { name: "4 / 5" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
  });
});
