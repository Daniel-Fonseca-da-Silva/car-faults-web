import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ReviewForm } from "./review-form";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const dict: Record<string, string> = {
      "vehicle.reviews.ratingLabel": "Your rating",
      "vehicle.reviews.commentPlaceholder":
        "Share your experience (optional)...",
      "vehicle.reviews.cancel": "Cancel",
      "vehicle.reviews.submitting": "Publishing...",
      "vehicle.reviews.submitError":
        "Couldn't submit the review. Please try again.",
    };
    return dict[key] ?? key;
  },
}));

describe("ReviewForm", () => {
  it("disables the submit button while no rating is selected", () => {
    render(<ReviewForm submitLabel="Publish review" onSubmit={jest.fn()} />);

    expect(
      screen.getByRole("button", { name: "Publish review" })
    ).toBeDisabled();
  });

  it("submits the selected rating with a null comment when none is written", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<ReviewForm submitLabel="Publish review" onSubmit={onSubmit} />);

    await user.click(screen.getByRole("radio", { name: "4 / 5" }));
    await user.click(screen.getByRole("button", { name: "Publish review" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ rating: 4, comment: null });
    });
  });

  it("trims the comment before submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<ReviewForm submitLabel="Publish review" onSubmit={onSubmit} />);

    await user.click(screen.getByRole("radio", { name: "5 / 5" }));
    await user.type(
      screen.getByPlaceholderText("Share your experience (optional)..."),
      "  Great fix  "
    );
    await user.click(screen.getByRole("button", { name: "Publish review" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        rating: 5,
        comment: "Great fix",
      });
    });
  });

  it("submits a null comment when only whitespace is written", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<ReviewForm submitLabel="Publish review" onSubmit={onSubmit} />);

    await user.click(screen.getByRole("radio", { name: "3 / 5" }));
    await user.type(
      screen.getByPlaceholderText("Share your experience (optional)..."),
      "   "
    );
    await user.click(screen.getByRole("button", { name: "Publish review" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ rating: 3, comment: null });
    });
  });

  it("shows an inline error and re-enables the form when submit fails", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockRejectedValue(new Error("network error"));
    render(<ReviewForm submitLabel="Publish review" onSubmit={onSubmit} />);

    await user.click(screen.getByRole("radio", { name: "2 / 5" }));
    await user.click(screen.getByRole("button", { name: "Publish review" }));

    expect(
      await screen.findByText("Couldn't submit the review. Please try again.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Publish review" })
    ).not.toBeDisabled();
  });

  it("calls onCancel when the cancel button is pressed", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    render(
      <ReviewForm
        submitLabel="Save"
        onSubmit={jest.fn()}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalled();
  });

  it("shows the submitting label while the submission is pending", async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void = () => {};
    const onSubmit = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        })
    );
    render(<ReviewForm submitLabel="Publish review" onSubmit={onSubmit} />);

    await user.click(screen.getByRole("radio", { name: "5 / 5" }));
    await user.click(screen.getByRole("button", { name: "Publish review" }));

    expect(
      await screen.findByRole("button", { name: "Publishing..." })
    ).toBeDisabled();

    resolveSubmit();

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "Publishing..." })
      ).not.toBeInTheDocument();
    });
  });
});
