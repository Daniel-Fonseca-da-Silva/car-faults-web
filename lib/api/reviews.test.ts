/**
 * @jest-environment node
 */
import {
  createReview,
  deleteReview,
  listReviews,
  updateReview,
} from "./reviews";

const apiFetchMock = jest.fn();

jest.mock("./client", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("listReviews", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("returns the reviews for a known issue", async () => {
    const reviews = [{ id: "r1" }];
    apiFetchMock.mockResolvedValue(jsonResponse(reviews));

    await expect(listReviews("ki-1")).resolves.toEqual(reviews);
    expect(apiFetchMock).toHaveBeenCalledWith("/v1/reviews?knownIssueId=ki-1");
  });

  it("throws on an error response", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(listReviews("ki-1")).rejects.toThrow(
      "Failed to load reviews: 500"
    );
  });
});

describe("createReview", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("posts the review and returns it", async () => {
    const created = { id: "r1", rating: 5 };
    apiFetchMock.mockResolvedValue(jsonResponse(created));

    await expect(
      createReview({ knownIssueId: "ki-1", rating: 5 })
    ).resolves.toEqual(created);
    expect(apiFetchMock).toHaveBeenCalledWith("/v1/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ knownIssueId: "ki-1", rating: 5 }),
    });
  });

  it("throws on an error response", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 400 }));

    await expect(
      createReview({ knownIssueId: "ki-1", rating: 5 })
    ).rejects.toThrow("Failed to create review: 400");
  });
});

describe("updateReview", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("patches the review and returns it", async () => {
    const updated = { id: "r1", rating: 4 };
    apiFetchMock.mockResolvedValue(jsonResponse(updated));

    await expect(updateReview("r1", { rating: 4 })).resolves.toEqual(updated);
    expect(apiFetchMock).toHaveBeenCalledWith("/v1/reviews/r1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: 4 }),
    });
  });

  it("throws on an error response", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(updateReview("r1", { rating: 4 })).rejects.toThrow(
      "Failed to update review: 404"
    );
  });
});

describe("deleteReview", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("deletes the review", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(deleteReview("r1")).resolves.toBeUndefined();
    expect(apiFetchMock).toHaveBeenCalledWith("/v1/reviews/r1", {
      method: "DELETE",
    });
  });

  it("throws on an error response", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(deleteReview("r1")).rejects.toThrow(
      "Failed to delete review: 404"
    );
  });
});
