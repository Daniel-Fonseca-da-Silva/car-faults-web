import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Comment } from "@/types/comment";
import type { UserProfile } from "@/types/user";

import { IssueComments } from "./issue-comments";

const listCommentsMock = jest.fn();
const createCommentMock = jest.fn();

jest.mock("@/lib/api/comments", () => ({
  listComments: (...args: unknown[]) => listCommentsMock(...args),
  createComment: (...args: unknown[]) => createCommentMock(...args),
}));

jest.mock("@/lib/api/storage", () => ({
  uploadCommentImage: jest.fn(),
}));

jest.mock("@/components/vehicle/comment-item", () => ({
  CommentItem: ({
    comment,
    onUpdated,
    onDeleted,
  }: {
    comment: Comment;
    isOwner: boolean;
    onUpdated: (comment: Comment) => void;
    onDeleted: (id: string) => void;
  }) => (
    <div data-testid={`comment-${comment.id}`}>
      {comment.body}
      <button onClick={() => onUpdated({ ...comment, body: "edited" })}>
        edit-{comment.id}
      </button>
      <button onClick={() => onDeleted(comment.id)}>
        delete-{comment.id}
      </button>
    </div>
  ),
}));

jest.mock("@/components/vehicle/login-to-comment-cta", () => ({
  LoginToCommentCta: () => <div data-testid="login-to-comment-cta" />,
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    const dict: Record<string, string> = {
      "vehicle.comments.title": "Comments",
      "vehicle.comments.count": "{count} comments",
      "vehicle.comments.empty": "No comments yet.",
      "vehicle.comments.loadError": "Couldn't load comments.",
      "vehicle.comments.placeholder": "Write a comment...",
      "vehicle.comments.publish": "Post",
      "vehicle.comments.publishing": "Posting...",
      "vehicle.comments.addImage": "Add photo",
      "vehicle.comments.removeImage": "Remove photo",
      "vehicle.comments.imageAlt": "Repair photo",
      "vehicle.comments.invalidImageType": "Unsupported image format.",
      "vehicle.comments.imageTooLarge": "The image exceeds the 5 MB limit.",
      "vehicle.comments.submitError": "Couldn't post the comment.",
      loadingMore: "Loading more…",
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
  role: "user",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const comment: Comment = {
  id: "comment-1",
  userId: "user-1",
  knownIssueId: "ki-1",
  body: "Had the same issue at 90k km.",
  imageUrl: null,
  userName: "Ana Silva",
  userAvatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("IssueComments", () => {
  afterEach(() => {
    listCommentsMock.mockReset();
    createCommentMock.mockReset();
  });

  it("shows the empty state and the login CTA for a guest", async () => {
    listCommentsMock.mockResolvedValue({ items: [], nextCursor: null });

    render(<IssueComments knownIssueId="ki-1" currentUser={null} />);

    expect(await screen.findByText("No comments yet.")).toBeInTheDocument();
    expect(screen.getByTestId("login-to-comment-cta")).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Write a comment...")
    ).not.toBeInTheDocument();
  });

  it("lists comments and shows the count for a logged-in user", async () => {
    listCommentsMock.mockResolvedValue({ items: [comment], nextCursor: null });

    render(<IssueComments knownIssueId="ki-1" currentUser={currentUser} />);

    expect(await screen.findByTestId("comment-comment-1")).toHaveTextContent(
      "Had the same issue at 90k km."
    );
    expect(listCommentsMock).toHaveBeenCalledWith("ki-1", { limit: 20 });
    expect(screen.getByText("Comments · 1 comments")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Write a comment...")
    ).toBeInTheDocument();
  });

  it("shows an error message when loading comments fails", async () => {
    listCommentsMock.mockRejectedValue(new Error("network error"));

    render(<IssueComments knownIssueId="ki-1" currentUser={null} />);

    expect(
      await screen.findByText("Couldn't load comments.")
    ).toBeInTheDocument();
  });

  it("prepends a newly created comment", async () => {
    const user = userEvent.setup();
    listCommentsMock.mockResolvedValue({ items: [], nextCursor: null });
    createCommentMock.mockResolvedValue({
      ...comment,
      id: "comment-2",
      body: "New comment",
    });

    render(<IssueComments knownIssueId="ki-1" currentUser={currentUser} />);

    await screen.findByPlaceholderText("Write a comment...");
    await user.type(
      screen.getByPlaceholderText("Write a comment..."),
      "New comment"
    );
    await user.click(screen.getByRole("button", { name: "Post" }));

    await waitFor(() => {
      expect(createCommentMock).toHaveBeenCalledWith({
        knownIssueId: "ki-1",
        body: "New comment",
        imageUrl: undefined,
      });
    });
    expect(await screen.findByTestId("comment-comment-2")).toHaveTextContent(
      "New comment"
    );
  });

  it("updates a comment in place via the child callback", async () => {
    const user = userEvent.setup();
    listCommentsMock.mockResolvedValue({ items: [comment], nextCursor: null });

    render(<IssueComments knownIssueId="ki-1" currentUser={currentUser} />);

    await user.click(await screen.findByText("edit-comment-1"));

    expect(screen.getByTestId("comment-comment-1")).toHaveTextContent(
      "edited"
    );
  });

  it("removes a comment via the child callback", async () => {
    const user = userEvent.setup();
    listCommentsMock.mockResolvedValue({ items: [comment], nextCursor: null });

    render(<IssueComments knownIssueId="ki-1" currentUser={currentUser} />);

    await user.click(await screen.findByText("delete-comment-1"));

    expect(screen.queryByTestId("comment-comment-1")).not.toBeInTheDocument();
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });

  it("concatenates the next comments page when the sentinel intersects", async () => {
    const secondComment: Comment = {
      ...comment,
      id: "comment-2",
      body: "Second page comment",
    };
    listCommentsMock
      .mockResolvedValueOnce({ items: [comment], nextCursor: "c2" })
      .mockResolvedValueOnce({ items: [secondComment], nextCursor: null });

    let observerCallback: IntersectionObserverCallback | null = null;
    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
      observe = jest.fn();
      disconnect = jest.fn();
      unobserve = jest.fn();
      takeRecords = () => [];
      root = null;
      rootMargin = "";
      thresholds = [];
    }
    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    });

    render(<IssueComments knownIssueId="ki-1" currentUser={currentUser} />);

    expect(await screen.findByTestId("comment-comment-1")).toBeInTheDocument();
    expect(listCommentsMock).toHaveBeenCalledWith("ki-1", { limit: 20 });

    observerCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );

    expect(await screen.findByTestId("comment-comment-2")).toHaveTextContent(
      "Second page comment"
    );
    expect(listCommentsMock).toHaveBeenLastCalledWith("ki-1", {
      limit: 20,
      cursor: "c2",
    });
  });
});
