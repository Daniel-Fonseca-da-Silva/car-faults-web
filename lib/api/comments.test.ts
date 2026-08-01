/**
 * @jest-environment node
 */
import {
  createComment,
  deleteComment,
  listComments,
  updateComment,
} from "./comments";

const apiFetchMock = jest.fn();

jest.mock("./client", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("listComments", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("returns the comments for a known issue", async () => {
    const comments = [{ id: "c1" }];
    apiFetchMock.mockResolvedValue(jsonResponse(comments));

    await expect(listComments("ki-1")).resolves.toEqual(comments);
    expect(apiFetchMock).toHaveBeenCalledWith(
      "/v1/comments?knownIssueId=ki-1"
    );
  });

  it("throws on an error response", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(listComments("ki-1")).rejects.toThrow(
      "Failed to load comments: 500"
    );
  });
});

describe("createComment", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("posts the comment and returns it", async () => {
    const created = { id: "c1", body: "Hi" };
    apiFetchMock.mockResolvedValue(jsonResponse(created));

    await expect(
      createComment({ knownIssueId: "ki-1", body: "Hi" })
    ).resolves.toEqual(created);
    expect(apiFetchMock).toHaveBeenCalledWith("/v1/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ knownIssueId: "ki-1", body: "Hi" }),
    });
  });

  it("throws on an error response", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 400 }));

    await expect(
      createComment({ knownIssueId: "ki-1", body: "Hi" })
    ).rejects.toThrow("Failed to create comment: 400");
  });
});

describe("updateComment", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("patches the comment and returns it", async () => {
    const updated = { id: "c1", body: "Updated" };
    apiFetchMock.mockResolvedValue(jsonResponse(updated));

    await expect(updateComment("c1", { body: "Updated" })).resolves.toEqual(
      updated
    );
    expect(apiFetchMock).toHaveBeenCalledWith("/v1/comments/c1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "Updated" }),
    });
  });

  it("throws on an error response", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(updateComment("c1", { body: "Updated" })).rejects.toThrow(
      "Failed to update comment: 404"
    );
  });
});

describe("deleteComment", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("deletes the comment", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(deleteComment("c1")).resolves.toBeUndefined();
    expect(apiFetchMock).toHaveBeenCalledWith("/v1/comments/c1", {
      method: "DELETE",
    });
  });

  it("throws on an error response", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(deleteComment("c1")).rejects.toThrow(
      "Failed to delete comment: 404"
    );
  });
});
