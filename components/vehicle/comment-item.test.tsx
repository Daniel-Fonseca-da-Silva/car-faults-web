import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Comment } from "@/types/comment";

import { CommentItem } from "./comment-item";

const updateCommentMock = jest.fn();
const deleteCommentMock = jest.fn();

jest.mock("@/lib/api/comments", () => ({
  updateComment: (...args: unknown[]) => updateCommentMock(...args),
  deleteComment: (...args: unknown[]) => deleteCommentMock(...args),
}));

jest.mock("@/lib/api/storage", () => ({
  uploadCommentImage: jest.fn(),
}));

jest.mock("next-intl", () => ({
  useLocale: () => "en-GB",
  useTranslations: () => (key: string) => {
    const dict: Record<string, string> = {
      "vehicle.comments.edit": "Edit",
      "vehicle.comments.delete": "Delete",
      "vehicle.comments.save": "Save",
      "vehicle.comments.cancel": "Cancel",
      "vehicle.comments.confirmDeleteDescription":
        "This action cannot be undone.",
      "vehicle.comments.confirmDeleteConfirm": "Delete",
      "vehicle.comments.deleteError": "Couldn't delete the comment.",
      "vehicle.comments.imageAlt": "Repair photo",
      "vehicle.comments.placeholder": "Write a comment...",
      "vehicle.comments.addImage": "Add photo",
      "vehicle.comments.removeImage": "Remove photo",
      "vehicle.comments.publishing": "Posting...",
      "vehicle.comments.invalidImageType": "Unsupported image format.",
      "vehicle.comments.imageTooLarge": "The image exceeds the 5 MB limit.",
      "vehicle.comments.submitError": "Couldn't post the comment.",
    };
    return dict[key] ?? key;
  },
}));

const now = new Date("2026-07-17T12:00:00.000Z");

const comment: Comment = {
  id: "comment-1",
  userId: "user-1",
  knownIssueId: "ki-1",
  body: "Had the same issue at 90k km.",
  imageUrl: null,
  userName: "Ana Silva",
  userAvatarUrl: null,
  createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
};

describe("CommentItem", () => {
  afterEach(() => {
    updateCommentMock.mockReset();
    deleteCommentMock.mockReset();
  });

  it("renders the author, relative time and body", () => {
    jest.useFakeTimers().setSystemTime(now);

    try {
      render(
        <CommentItem
          comment={comment}
          isOwner={false}
          onUpdated={jest.fn()}
          onDeleted={jest.fn()}
        />
      );

      expect(screen.getByText("Ana Silva")).toBeInTheDocument();
      expect(screen.getByText("1 hour ago")).toBeInTheDocument();
      expect(
        screen.getByText("Had the same issue at 90k km.")
      ).toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it("renders the comment image when present", () => {
    render(
      <CommentItem
        comment={{
          ...comment,
          imageUrl: "https://cdn.example.com/comments/user-1/uuid.jpg",
        }}
        isOwner={false}
        onUpdated={jest.fn()}
        onDeleted={jest.fn()}
      />
    );

    expect(screen.getByAltText("Repair photo")).toHaveAttribute(
      "src",
      "https://cdn.example.com/comments/user-1/uuid.jpg"
    );
  });

  it("hides edit/delete actions for non-owners", () => {
    render(
      <CommentItem
        comment={comment}
        isOwner={false}
        onUpdated={jest.fn()}
        onDeleted={jest.fn()}
      />
    );

    expect(
      screen.queryByRole("button", { name: "Edit" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete" })
    ).not.toBeInTheDocument();
  });

  it("switches to edit mode and calls updateComment on submit", async () => {
    const user = userEvent.setup({ delay: null });
    updateCommentMock.mockResolvedValue({ ...comment, body: "Updated body" });
    const onUpdated = jest.fn();

    render(
      <CommentItem
        comment={comment}
        isOwner
        onUpdated={onUpdated}
        onDeleted={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const textarea = screen.getByPlaceholderText("Write a comment...");
    await user.clear(textarea);
    await user.type(textarea, "Updated body");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateCommentMock).toHaveBeenCalledWith("comment-1", {
        body: "Updated body",
        imageUrl: undefined,
      });
      expect(onUpdated).toHaveBeenCalledWith({
        ...comment,
        body: "Updated body",
      });
      expect(
        screen.queryByPlaceholderText("Write a comment...")
      ).not.toBeInTheDocument();
    });
  });

  it("exits edit mode when cancel is pressed", async () => {
    const user = userEvent.setup();

    render(
      <CommentItem
        comment={comment}
        isOwner
        onUpdated={jest.fn()}
        onDeleted={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(
      screen.getByPlaceholderText("Write a comment...")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.queryByPlaceholderText("Write a comment...")
    ).not.toBeInTheDocument();
  });

  it("deletes the comment after confirming", async () => {
    const user = userEvent.setup({ delay: null });
    deleteCommentMock.mockResolvedValue(undefined);
    const onDeleted = jest.fn();

    render(
      <CommentItem
        comment={comment}
        isOwner
        onUpdated={jest.fn()}
        onDeleted={onDeleted}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(
      screen.getByText("This action cannot be undone.")
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Delete" })
    );

    await waitFor(() => {
      expect(deleteCommentMock).toHaveBeenCalledWith("comment-1");
      expect(onDeleted).toHaveBeenCalledWith("comment-1");
    });
  });

  it("cancels the delete confirmation without calling the API", async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <CommentItem
        comment={comment}
        isOwner
        onUpdated={jest.fn()}
        onDeleted={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(deleteCommentMock).not.toHaveBeenCalled();
    expect(
      screen.queryByText("This action cannot be undone.")
    ).not.toBeInTheDocument();
  });

  it("shows an inline error and keeps the comment when delete fails", async () => {
    const user = userEvent.setup({ delay: null });
    deleteCommentMock.mockRejectedValue(new Error("network error"));
    const onDeleted = jest.fn();

    render(
      <CommentItem
        comment={comment}
        isOwner
        onUpdated={jest.fn()}
        onDeleted={onDeleted}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(
      screen.getByRole("button", { name: "Delete" })
    );

    expect(
      await screen.findByText("Couldn't delete the comment.")
    ).toBeInTheDocument();
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
