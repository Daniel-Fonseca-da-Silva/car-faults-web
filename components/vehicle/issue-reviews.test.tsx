import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Review } from "@/types/review";
import type { UserProfile } from "@/types/user";

import { IssueReviews } from "./issue-reviews";

const listReviewsMock = jest.fn();
const createReviewMock = jest.fn();

jest.mock("@/lib/api/reviews", () => ({
  listReviews: (...args: unknown[]) => listReviewsMock(...args),
  createReview: (...args: unknown[]) => createReviewMock(...args),
}));

jest.mock("@/components/vehicle/review-item", () => ({
  ReviewItem: ({
    review,
    isOwner,
    onUpdated,
    onDeleted,
  }: {
    review: Review;
    isOwner: boolean;
    onUpdated: (review: Review) => void;
    onDeleted: (id: string) => void;
  }) => (
    <div data-testid={`review-${review.id}`}>
      {review.rating} · {isOwner ? "owner" : "guest-review"}
      <button onClick={() => onUpdated({ ...review, rating: 5 })}>
        edit-{review.id}
      </button>
      <button onClick={() => onDeleted(review.id)}>delete-{review.id}</button>
    </div>
  ),
}));

jest.mock("@/components/vehicle/login-to-review-cta", () => ({
  LoginToReviewCta: () => <div data-testid="login-to-review-cta" />,
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    const dict: Record<string, string> = {
      "vehicle.reviews.title": "Rate this issue",
      "vehicle.reviews.count": "{count} reviews",
      "vehicle.reviews.empty": "No reviews yet.",
      "vehicle.reviews.loadError": "Couldn't load reviews.",
      "vehicle.reviews.averageLabel": "Average rating",
      "vehicle.reviews.ratingLabel": "Your rating",
      "vehicle.reviews.commentPlaceholder": "Share your experience (optional)...",
      "vehicle.reviews.publish": "Publish review",
      "vehicle.reviews.submitting": "Publishing...",
      "vehicle.reviews.cancel": "Cancel",
      "vehicle.reviews.submitError": "Couldn't submit the review.",
    };
    const template = dict[key] ?? key;
    if (!values) return template;
    return Object.entries(values).reduce(
      (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
      template
    );
  },
}));

const currentUser: UserProfile = {
  id: "user-1",
  email: "ana@example.com",
  name: "Ana Silva",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const otherUserReview: Review = {
  id: "review-1",
  userId: "user-2",
  knownIssueId: "ki-1",
  rating: 4,
  comment: "Same issue at 90k km.",
  userName: "Ricardo Moura",
  userAvatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const ownReview: Review = {
  ...otherUserReview,
  id: "review-2",
  userId: "user-1",
  userName: "Ana Silva",
};

describe("IssueReviews", () => {
  afterEach(() => {
    listReviewsMock.mockReset();
    createReviewMock.mockReset();
  });

  it("shows the empty state and the login CTA for a guest", async () => {
    listReviewsMock.mockResolvedValue([]);

    render(<IssueReviews knownIssueId="ki-1" currentUser={null} />);

    expect(await screen.findByText("No reviews yet.")).toBeInTheDocument();
    expect(screen.getByTestId("login-to-review-cta")).toBeInTheDocument();
  });

  it("shows an error message when loading reviews fails", async () => {
    listReviewsMock.mockRejectedValue(new Error("network error"));

    render(<IssueReviews knownIssueId="ki-1" currentUser={null} />);

    expect(
      await screen.findByText("Couldn't load reviews.")
    ).toBeInTheDocument();
  });

  it("lists reviews with the average rating and count", async () => {
    listReviewsMock.mockResolvedValue([otherUserReview]);

    render(<IssueReviews knownIssueId="ki-1" currentUser={null} />);

    expect(await screen.findByTestId("review-review-1")).toHaveTextContent(
      "4 · guest-review"
    );
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("1 reviews")).toBeInTheDocument();
  });

  it("marks the current user's review as the owner", async () => {
    listReviewsMock.mockResolvedValue([otherUserReview, ownReview]);

    render(<IssueReviews knownIssueId="ki-1" currentUser={currentUser} />);

    expect(await screen.findByTestId("review-review-2")).toHaveTextContent(
      "owner"
    );
    expect(screen.getByTestId("review-review-1")).toHaveTextContent(
      "guest-review"
    );
  });

  it("shows the review form for a logged-in user without a review, and hides it once they own one", async () => {
    listReviewsMock.mockResolvedValue([otherUserReview]);

    render(<IssueReviews knownIssueId="ki-1" currentUser={currentUser} />);

    await screen.findByTestId("review-review-1");
    expect(
      screen.getByRole("button", { name: "Publish review" })
    ).toBeInTheDocument();
  });

  it("does not show the review form when the user already has a review", async () => {
    listReviewsMock.mockResolvedValue([ownReview]);

    render(<IssueReviews knownIssueId="ki-1" currentUser={currentUser} />);

    await screen.findByTestId("review-review-2");
    expect(
      screen.queryByRole("button", { name: "Publish review" })
    ).not.toBeInTheDocument();
  });

  it("creates a review by picking a star rating and submitting", async () => {
    const user = userEvent.setup();
    listReviewsMock.mockResolvedValue([]);
    createReviewMock.mockResolvedValue({
      ...ownReview,
      id: "review-3",
      rating: 5,
    });

    render(<IssueReviews knownIssueId="ki-1" currentUser={currentUser} />);

    await screen.findByText("No reviews yet.");
    await user.click(screen.getByRole("radio", { name: "5 / 5" }));
    await user.click(screen.getByRole("button", { name: "Publish review" }));

    await waitFor(() => {
      expect(createReviewMock).toHaveBeenCalledWith({
        knownIssueId: "ki-1",
        rating: 5,
        comment: null,
      });
    });
    expect(await screen.findByTestId("review-review-3")).toHaveTextContent(
      "5 · owner"
    );
  });

  it("updates a review in place via the child callback", async () => {
    const user = userEvent.setup();
    listReviewsMock.mockResolvedValue([otherUserReview]);

    render(<IssueReviews knownIssueId="ki-1" currentUser={currentUser} />);

    await user.click(await screen.findByText("edit-review-1"));

    expect(screen.getByTestId("review-review-1")).toHaveTextContent("5 ·");
  });

  it("removes a review via the child callback", async () => {
    const user = userEvent.setup();
    listReviewsMock.mockResolvedValue([otherUserReview]);

    render(<IssueReviews knownIssueId="ki-1" currentUser={currentUser} />);

    await user.click(await screen.findByText("delete-review-1"));

    expect(screen.queryByTestId("review-review-1")).not.toBeInTheDocument();
    expect(screen.getByText("No reviews yet.")).toBeInTheDocument();
  });

  it("resets and reloads reviews when knownIssueId changes", async () => {
    listReviewsMock.mockResolvedValueOnce([otherUserReview]);

    const { rerender } = render(
      <IssueReviews knownIssueId="ki-1" currentUser={null} />
    );

    await screen.findByTestId("review-review-1");

    let resolveSecond: (reviews: Review[]) => void = () => {};
    listReviewsMock.mockReturnValueOnce(
      new Promise<Review[]>((resolve) => {
        resolveSecond = resolve;
      })
    );

    rerender(<IssueReviews knownIssueId="ki-2" currentUser={null} />);

    expect(screen.queryByTestId("review-review-1")).not.toBeInTheDocument();
    expect(screen.queryByText("No reviews yet.")).not.toBeInTheDocument();

    resolveSecond([]);

    expect(await screen.findByText("No reviews yet.")).toBeInTheDocument();
    expect(listReviewsMock).toHaveBeenLastCalledWith("ki-2");
  });
});
