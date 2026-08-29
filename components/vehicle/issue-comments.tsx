"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { InfiniteScrollSentinel } from "@/components/lists/infinite-scroll-sentinel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CommentForm,
  type CommentFormSubmitData,
} from "@/components/vehicle/comment-form";
import { CommentItem } from "@/components/vehicle/comment-item";
import { LoginToCommentCta } from "@/components/vehicle/login-to-comment-cta";
import { createComment, listComments } from "@/lib/api/comments";
import { DISCUSSION_PAGE_SIZE } from "@/lib/lists/page-sizes";
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
  const tCommon = useTranslations("common");

  const [comments, setComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [activeIssueId, setActiveIssueId] = useState(knownIssueId);

  if (activeIssueId !== knownIssueId) {
    setActiveIssueId(knownIssueId);
    setComments([]);
    setNextCursor(null);
    setLoading(true);
    setIsLoadingMore(false);
    setError(false);
  }

  useEffect(() => {
    let cancelled = false;

    listComments(knownIssueId, { limit: DISCUSSION_PAGE_SIZE })
      .then((result) => {
        if (!cancelled) {
          setComments(result.items);
          setNextCursor(result.nextCursor);
        }
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

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const page = await listComments(knownIssueId, {
        limit: DISCUSSION_PAGE_SIZE,
        cursor: nextCursor,
      });
      setComments((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch {
      setError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, knownIssueId, nextCursor]);

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

      {!loading && error && comments.length === 0 && (
        <p className="text-sm text-destructive">
          {t("vehicle.comments.loadError")}
        </p>
      )}

      {!loading && !error && comments.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t("vehicle.comments.empty")}
        </p>
      )}

      {!loading && comments.length > 0 && (
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
          <InfiniteScrollSentinel
            hasMore={nextCursor !== null}
            isLoading={isLoadingMore}
            onIntersect={loadMore}
            loadingLabel={tCommon("loadingMore")}
          />
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
