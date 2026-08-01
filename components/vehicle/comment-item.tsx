"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CommentForm,
  type CommentFormSubmitData,
} from "@/components/vehicle/comment-form";
import { deleteComment, updateComment } from "@/lib/api/comments";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import type { Comment } from "@/types/comment";

interface CommentItemProps {
  comment: Comment;
  isOwner: boolean;
  onUpdated: (comment: Comment) => void;
  onDeleted: (id: string) => void;
}

export function CommentItem({
  comment,
  isOwner,
  onUpdated,
  onDeleted,
}: CommentItemProps) {
  const t = useTranslations("faults");
  const locale = useLocale();

  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleUpdate(data: CommentFormSubmitData) {
    const updated = await updateComment(comment.id, {
      body: data.body,
      imageUrl: data.imageUrl,
    });
    onUpdated(updated);
    setIsEditing(false);
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteComment(comment.id);
      onDeleted(comment.id);
    } catch {
      setDeleteError(t("vehicle.comments.deleteError"));
      setDeleting(false);
    }
  }

  if (isEditing) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <CommentForm
          initialBody={comment.body}
          initialImageUrl={comment.imageUrl}
          submitLabel={t("vehicle.comments.save")}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarImage
              src={comment.userAvatarUrl ?? undefined}
              alt={comment.userName ?? ""}
            />
            <AvatarFallback>
              {getInitials(comment.userName ?? "?")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">
              {comment.userName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.createdAt, locale)}
            </p>
          </div>
        </div>

        {isOwner && !confirmingDelete && (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              {t("vehicle.comments.edit")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingDelete(true)}
            >
              {t("vehicle.comments.delete")}
            </Button>
          </div>
        )}
      </div>

      <p className="mt-3 text-sm text-foreground">{comment.body}</p>

      {comment.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={comment.imageUrl}
          alt={t("vehicle.comments.imageAlt")}
          className="mt-3 max-h-60 rounded-lg border border-border object-cover"
        />
      )}

      {confirmingDelete && (
        <div className="mt-3 flex items-center justify-end gap-2 rounded-lg bg-muted/50 p-3">
          <p className="mr-auto text-sm text-muted-foreground">
            {t("vehicle.comments.confirmDeleteDescription")}
          </p>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmingDelete(false)}
            disabled={deleting}
          >
            {t("vehicle.comments.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {t("vehicle.comments.confirmDeleteConfirm")}
          </Button>
        </div>
      )}
    </div>
  );
}
