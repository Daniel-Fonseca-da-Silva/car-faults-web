/**
 * @jest-environment node
 */
import {
  createComment,
  deleteComment,
  listComments,
  updateComment,
} from "./comments";

const serverApiFetchMock = jest.fn();

jest.mock("./server-client", () => ({
  serverApiFetch: (...args: unknown[]) => serverApiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("listComments", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("returns the comments for a known issue", async () => {
    const page = { items: [{ id: "c1" }], nextCursor: null };
    serverApiFetchMock.mockResolvedValue(jsonResponse(page));

    await expect(listComments("ki-1")).resolves.toEqual(page);
    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/comments?knownIssueId=ki-1"
    );
  });

  it("appends limit and cursor when given", async () => {
    serverApiFetchMock.mockResolvedValue(
      jsonResponse({ items: [], nextCursor: null })
    );

    await listComments("ki-1", { limit: 20, cursor: "c1" });

    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/comments?knownIssueId=ki-1&limit=20&cursor=c1"
    );
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(listComments("ki-1")).rejects.toThrow(
      "Failed to load comments: 500"
    );
  });
});

describe("createComment", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("posts the comment and returns it", async () => {
    const created = { id: "c1", body: "Hi" };
    serverApiFetchMock.mockResolvedValue(jsonResponse(created));

    await expect(
      createComment({ knownIssueId: "ki-1", body: "Hi" })
    ).resolves.toEqual(created);
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ knownIssueId: "ki-1", body: "Hi" }),
    });
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 400 }));

    await expect(
      createComment({ knownIssueId: "ki-1", body: "Hi" })
    ).rejects.toThrow("Failed to create comment: 400");
  });
});

describe("updateComment", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("patches the comment and returns it", async () => {
    const updated = { id: "c1", body: "Updated" };
    serverApiFetchMock.mockResolvedValue(jsonResponse(updated));

    await expect(updateComment("c1", { body: "Updated" })).resolves.toEqual(
      updated
    );
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/comments/c1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "Updated" }),
    });
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(updateComment("c1", { body: "Updated" })).rejects.toThrow(
      "Failed to update comment: 404"
    );
  });
});

describe("deleteComment", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("deletes the comment", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(deleteComment("c1")).resolves.toBeUndefined();
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/comments/c1", {
      method: "DELETE",
    });
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(deleteComment("c1")).rejects.toThrow(
      "Failed to delete comment: 404"
    );
  });
});
