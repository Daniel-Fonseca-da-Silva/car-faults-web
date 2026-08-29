"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { InfiniteScrollSentinel } from "@/components/lists/infinite-scroll-sentinel";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginToReviewCta } from "@/components/vehicle/login-to-review-cta";
import {
  ReviewForm,
  type ReviewFormSubmitData,
} from "@/components/vehicle/review-form";
import { ReviewItem } from "@/components/vehicle/review-item";
import { StarRating } from "@/components/vehicle/star-rating";
import { createReview, listReviews } from "@/lib/api/reviews";
import { DISCUSSION_PAGE_SIZE } from "@/lib/lists/page-sizes";
import { averageRating } from "@/lib/reviews/average-rating";
import type { Review } from "@/types/review";
import type { UserProfile } from "@/types/user";

interface IssueReviewsProps {
  knownIssueId: string;
  currentUser: UserProfile | null;
}

export function IssueReviews({
  knownIssueId,
  currentUser,
}: IssueReviewsProps) {
  const t = useTranslations("faults");
  const tCommon = useTranslations("common");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [activeIssueId, setActiveIssueId] = useState(knownIssueId);

  if (activeIssueId !== knownIssueId) {
    setActiveIssueId(knownIssueId);
    setReviews([]);
    setNextCursor(null);
    setLoading(true);
    setIsLoadingMore(false);
    setError(false);
  }

  useEffect(() => {
    let cancelled = false;

    listReviews(knownIssueId, { limit: DISCUSSION_PAGE_SIZE })
      .then((result) => {
        if (!cancelled) {
          setReviews(result.items);
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
      const page = await listReviews(knownIssueId, {
        limit: DISCUSSION_PAGE_SIZE,
        cursor: nextCursor,
      });
      setReviews((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch {
      setError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, knownIssueId, nextCursor]);

  async function handleCreate(data: ReviewFormSubmitData) {
    const created = await createReview({
      knownIssueId,
      rating: data.rating,
      comment: data.comment,
    });
    setReviews((current) => [created, ...current]);
  }

  function handleUpdated(updated: Review) {
    setReviews((current) =>
      current.map((review) => (review.id === updated.id ? updated : review))
    );
  }

  function handleDeleted(id: string) {
    setReviews((current) => current.filter((review) => review.id !== id));
  }

  const ownReview = currentUser
    ? (reviews.find((review) => review.userId === currentUser.id) ?? null)
    : null;
  const average = averageRating(reviews);

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm font-semibold text-foreground">
        {t("vehicle.reviews.title")}
      </p>

      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {!loading && error && reviews.length === 0 && (
        <p className="text-sm text-destructive">
          {t("vehicle.reviews.loadError")}
        </p>
      )}

      {!loading && !error && reviews.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t("vehicle.reviews.empty")}
        </p>
      )}

      {!loading && reviews.length > 0 && (
        <>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold text-foreground">{average}</p>
            <div>
              <StarRating value={average} label={t("vehicle.reviews.averageLabel")} />
              <p className="text-xs text-muted-foreground">
                {t("vehicle.reviews.count", { count: reviews.length })}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                isOwner={currentUser?.id === review.userId}
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
        </>
      )}

      {!loading && !error && currentUser && !ownReview && (
        <ReviewForm
          submitLabel={t("vehicle.reviews.publish")}
          onSubmit={handleCreate}
        />
      )}

      {!loading && !error && !currentUser && <LoginToReviewCta />}
    </div>
  );
}
