import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Review } from "@/types/review";

import { ReviewItem } from "./review-item";

const updateReviewMock = jest.fn();
const deleteReviewMock = jest.fn();

jest.mock("@/lib/api/reviews", () => ({
  updateReview: (...args: unknown[]) => updateReviewMock(...args),
  deleteReview: (...args: unknown[]) => deleteReviewMock(...args),
}));

jest.mock("next-intl", () => ({
  useLocale: () => "en-GB",
  useTranslations: () => (key: string) => {
    const dict: Record<string, string> = {
      "vehicle.reviews.yourBadge": "your review",
      "vehicle.reviews.edit": "Edit",
      "vehicle.reviews.delete": "Delete",
      "vehicle.reviews.save": "Save",
      "vehicle.reviews.cancel": "Cancel",
      "vehicle.reviews.confirmDeleteDescription":
        "This action cannot be undone.",
      "vehicle.reviews.confirmDeleteConfirm": "Delete",
      "vehicle.reviews.deleteError":
        "Couldn't delete the review. Please try again.",
      "vehicle.reviews.ratingLabel": "Your rating",
      "vehicle.reviews.commentPlaceholder":
        "Share your experience (optional)...",
      "vehicle.reviews.submitting": "Publishing...",
      "vehicle.reviews.submitError":
        "Couldn't submit the review. Please try again.",
    };
    return dict[key] ?? key;
  },
}));

const now = new Date("2026-07-17T12:00:00.000Z");

const review: Review = {
  id: "review-1",
  userId: "user-1",
  knownIssueId: "ki-1",
  rating: 4,
  comment: "Great fix after replacing the battery.",
  userName: "Ana Silva",
  userAvatarUrl: null,
  createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
};

describe("ReviewItem", () => {
  afterEach(() => {
    updateReviewMock.mockReset();
    deleteReviewMock.mockReset();
  });

  it("renders the author, relative time, rating and comment", () => {
    jest.useFakeTimers().setSystemTime(now);

    try {
      render(
        <ReviewItem
          review={review}
          isOwner={false}
          onUpdated={jest.fn()}
          onDeleted={jest.fn()}
        />
      );

      expect(screen.getByText("Ana Silva")).toBeInTheDocument();
      expect(screen.getByText("1 hour ago")).toBeInTheDocument();
      expect(screen.getByRole("img", { name: "4 / 5" })).toBeInTheDocument();
      expect(
        screen.getByText("Great fix after replacing the battery.")
      ).toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it("omits the comment paragraph when there is none", () => {
    render(
      <ReviewItem
        review={{ ...review, comment: null }}
        isOwner={false}
        onUpdated={jest.fn()}
        onDeleted={jest.fn()}
      />
    );

    expect(
      screen.queryByText("Great fix after replacing the battery.")
    ).not.toBeInTheDocument();
  });

  it("hides the owner badge and actions for non-owners", () => {
    render(
      <ReviewItem
        review={review}
        isOwner={false}
        onUpdated={jest.fn()}
        onDeleted={jest.fn()}
      />
    );

    expect(screen.queryByText("your review")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete" })
    ).not.toBeInTheDocument();
  });

  it("shows the owner badge and actions for the review owner", () => {
    render(
      <ReviewItem
        review={review}
        isOwner
        onUpdated={jest.fn()}
        onDeleted={jest.fn()}
      />
    );

    expect(screen.getByText("your review")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("switches to edit mode and calls updateReview on submit", async () => {
    const user = userEvent.setup({ delay: null });
    const updated = { ...review, rating: 5 };
    updateReviewMock.mockResolvedValue(updated);
    const onUpdated = jest.fn();

    render(
      <ReviewItem
        review={review}
        isOwner
        onUpdated={onUpdated}
        onDeleted={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("radio", { name: "5 / 5" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateReviewMock).toHaveBeenCalledWith("review-1", {
        rating: 5,
        comment: review.comment,
      });
      expect(onUpdated).toHaveBeenCalledWith(updated);
      expect(
        screen.queryByPlaceholderText("Share your experience (optional)...")
      ).not.toBeInTheDocument();
    });
  });

  it("exits edit mode when cancel is pressed", async () => {
    const user = userEvent.setup();

    render(
      <ReviewItem
        review={review}
        isOwner
        onUpdated={jest.fn()}
        onDeleted={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.queryByRole("button", { name: "Save" })
    ).not.toBeInTheDocument();
  });

  it("deletes the review after confirming", async () => {
    const user = userEvent.setup({ delay: null });
    deleteReviewMock.mockResolvedValue(undefined);
    const onDeleted = jest.fn();

    render(
      <ReviewItem
        review={review}
        isOwner
        onUpdated={jest.fn()}
        onDeleted={onDeleted}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(
      screen.getByText("This action cannot be undone.")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteReviewMock).toHaveBeenCalledWith("review-1");
      expect(onDeleted).toHaveBeenCalledWith("review-1");
    });
  });

  it("cancels the delete confirmation without calling the API", async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <ReviewItem
        review={review}
        isOwner
        onUpdated={jest.fn()}
        onDeleted={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(deleteReviewMock).not.toHaveBeenCalled();
    expect(
      screen.queryByText("This action cannot be undone.")
    ).not.toBeInTheDocument();
  });

  it("shows an inline error and keeps the review when delete fails", async () => {
    const user = userEvent.setup({ delay: null });
    deleteReviewMock.mockRejectedValue(new Error("network error"));
    const onDeleted = jest.fn();

    render(
      <ReviewItem
        review={review}
        isOwner
        onUpdated={jest.fn()}
        onDeleted={onDeleted}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(
      await screen.findByText("Couldn't delete the review. Please try again.")
    ).toBeInTheDocument();
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
