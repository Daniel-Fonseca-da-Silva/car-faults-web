"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  CommentForm,
  type CommentFormSubmitData,
} from "@/components/vehicle/comment-form";
import { CommentItem } from "@/components/vehicle/comment-item";
import { LoginToCommentCta } from "@/components/vehicle/login-to-comment-cta";
import { createComment, listComments } from "@/lib/api/comments";
import type { Comment } from "@/types/comment";
import type { UserProfile } from "@/types/user";

interface IssueCommentsProps {
  knownIssueId: string;
  currentUser: UserProfile | null;
}

export function IssueComments({
  knownIssueId,
  currentUser,
}: IssueCommentsProps) {
  const t = useTranslations("faults");

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeIssueId, setActiveIssueId] = useState(knownIssueId);

  if (activeIssueId !== knownIssueId) {
    setActiveIssueId(knownIssueId);
    setComments([]);
    setLoading(true);
    setError(false);
  }

  useEffect(() => {
    let cancelled = false;

    listComments(knownIssueId)
      .then((result) => {
        if (!cancelled) setComments(result);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [knownIssueId]);

  async function handleCreate(data: CommentFormSubmitData) {
    const created = await createComment({
      knownIssueId,
      body: data.body,
      imageUrl: data.imageUrl,
    });
    setComments((current) => [created, ...current]);
  }

  function handleUpdated(updated: Comment) {
    setComments((current) =>
      current.map((comment) =>
        comment.id === updated.id ? updated : comment
      )
    );
  }

  function handleDeleted(id: string) {
    setComments((current) => current.filter((comment) => comment.id !== id));
  }

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm font-semibold text-foreground">
        {t("vehicle.comments.title")}
        {comments.length > 0 &&
          ` · ${t("vehicle.comments.count", { count: comments.length })}`}
      </p>

      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-destructive">
          {t("vehicle.comments.loadError")}
        </p>
      )}

      {!loading && !error && comments.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t("vehicle.comments.empty")}
        </p>
      )}

      {!loading && !error && comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isOwner={currentUser?.id === comment.userId}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      {currentUser ? (
        <CommentForm
          submitLabel={t("vehicle.comments.publish")}
          onSubmit={handleCreate}
        />
      ) : (
        <LoginToCommentCta />
      )}
    </div>
  );
}
