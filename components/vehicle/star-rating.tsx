"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

const RATING_VALUES = [1, 2, 3, 4, 5] as const;

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<StarRatingProps["size"]>, string> = {
  sm: "size-3.5",
  md: "size-5",
  lg: "size-7",
};

export function StarRating({
  value,
  onChange,
  label,
  size = "md",
  className,
}: StarRatingProps) {
  const roundedValue = Math.round(value);
  const iconClassName = SIZE_CLASSES[size];

  if (!onChange) {
    return (
      <div
        role="img"
        aria-label={label ?? `${value} / 5`}
        className={cn("flex items-center gap-0.5", className)}
      >
        {RATING_VALUES.map((star) => (
          <Star
            key={star}
            aria-hidden="true"
            className={cn(
              iconClassName,
              star <= roundedValue
                ? "fill-primary text-primary"
                : "fill-transparent text-muted-foreground"
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex items-center gap-0.5", className)}
    >
      {RATING_VALUES.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === roundedValue}
          aria-label={`${star} / 5`}
          onClick={() => onChange(star)}
          className="p-0.5"
        >
          <Star
            aria-hidden="true"
            className={cn(
              iconClassName,
              star <= roundedValue
                ? "fill-primary text-primary"
                : "fill-transparent text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}
