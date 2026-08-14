"use server";

import { serverApiFetch } from "@/lib/api/server-client";
import type { Review } from "@/types/review";

export interface CreateReviewInput {
  knownIssueId: string;
  rating: number;
  comment?: string | null;
}

export interface UpdateReviewInput {
  rating: number;
  comment?: string | null;
}

export async function listReviews(knownIssueId: string): Promise<Review[]> {
  const query = new URLSearchParams({ knownIssueId });
  const response = await serverApiFetch(`/v1/reviews?${query.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to load reviews: ${response.status}`);
  }

  return (await response.json()) as Review[];
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const response = await serverApiFetch("/v1/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to create review: ${response.status}`);
  }

  return (await response.json()) as Review;
}

export async function updateReview(
  id: string,
  input: UpdateReviewInput
): Promise<Review> {
  const response = await serverApiFetch(`/v1/reviews/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to update review: ${response.status}`);
  }

  return (await response.json()) as Review;
}

export async function deleteReview(id: string): Promise<void> {
  const response = await serverApiFetch(`/v1/reviews/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete review: ${response.status}`);
  }
}
