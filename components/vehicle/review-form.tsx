"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/vehicle/star-rating";

export interface ReviewFormSubmitData {
  rating: number;
  comment?: string | null;
}

interface ReviewFormProps {
  initialRating?: number;
  initialComment?: string | null;
  submitLabel: string;
  onSubmit: (data: ReviewFormSubmitData) => Promise<void>;
  onCancel?: () => void;
}

export function ReviewForm({
  initialRating = 0,
  initialComment = "",
  submitLabel,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const t = useTranslations("faults");

  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (rating < 1 || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({ rating, comment: comment.trim() || null });
      setRating(0);
      setComment("");
    } catch {
      setError(t("vehicle.reviews.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <StarRating
        value={rating}
        onChange={setRating}
        label={t("vehicle.reviews.ratingLabel")}
        size="lg"
      />

      <Textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder={t("vehicle.reviews.commentPlaceholder")}
        disabled={submitting}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={submitting}
          >
            {t("vehicle.reviews.cancel")}
          </Button>
        )}
        <Button type="submit" size="sm" disabled={submitting || rating < 1}>
          {submitting ? t("vehicle.reviews.submitting") : submitLabel}
        </Button>
      </div>
    </form>
  );
}
