import type { Review } from "@/types/review";

import { averageRating } from "./average-rating";

function makeReview(rating: number): Review {
  return {
    id: `r-${rating}-${Math.random()}`,
    userId: "user-1",
    knownIssueId: "ki-1",
    rating,
    comment: null,
    userName: "Ana Silva",
    userAvatarUrl: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("averageRating", () => {
  it("returns 0 for an empty list", () => {
    expect(averageRating([])).toBe(0);
  });

  it("returns the rating for a single review", () => {
    expect(averageRating([makeReview(4)])).toBe(4);
  });

  it("rounds the average to one decimal place", () => {
    const reviews = [makeReview(5), makeReview(4), makeReview(4)];
    expect(averageRating(reviews)).toBe(4.3);
  });
});
