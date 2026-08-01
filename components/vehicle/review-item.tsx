"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ReviewForm,
  type ReviewFormSubmitData,
} from "@/components/vehicle/review-form";
import { StarRating } from "@/components/vehicle/star-rating";
import { deleteReview, updateReview } from "@/lib/api/reviews";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import type { Review } from "@/types/review";

interface ReviewItemProps {
  review: Review;
  isOwner: boolean;
  onUpdated: (review: Review) => void;
  onDeleted: (id: string) => void;
}

export function ReviewItem({
  review,
  isOwner,
  onUpdated,
  onDeleted,
}: ReviewItemProps) {
  const t = useTranslations("faults");
  const locale = useLocale();

  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleUpdate(data: ReviewFormSubmitData) {
    const updated = await updateReview(review.id, {
      rating: data.rating,
      comment: data.comment,
    });
    onUpdated(updated);
    setIsEditing(false);
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteReview(review.id);
      onDeleted(review.id);
    } catch {
      setDeleteError(t("vehicle.reviews.deleteError"));
      setDeleting(false);
    }
  }

  if (isEditing) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <ReviewForm
          initialRating={review.rating}
          initialComment={review.comment}
          submitLabel={t("vehicle.reviews.save")}
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
              src={review.userAvatarUrl ?? undefined}
              alt={review.userName ?? ""}
            />
            <AvatarFallback>
              {getInitials(review.userName ?? "?")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">
                {review.userName}
              </p>
              {isOwner && (
                <Badge variant="outline">
                  {t("vehicle.reviews.yourBadge")}
                </Badge>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <StarRating value={review.rating} size="sm" />
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(review.createdAt, locale)}
              </p>
            </div>
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
              {t("vehicle.reviews.edit")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingDelete(true)}
            >
              {t("vehicle.reviews.delete")}
            </Button>
          </div>
        )}
      </div>

      {review.comment && (
        <p className="mt-3 text-sm text-foreground">{review.comment}</p>
      )}

      {confirmingDelete && (
        <div className="mt-3 flex items-center justify-end gap-2 rounded-lg bg-muted/50 p-3">
          <p className="mr-auto text-sm text-muted-foreground">
            {t("vehicle.reviews.confirmDeleteDescription")}
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
            {t("vehicle.reviews.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {t("vehicle.reviews.confirmDeleteConfirm")}
          </Button>
        </div>
      )}
    </div>
  );
}
