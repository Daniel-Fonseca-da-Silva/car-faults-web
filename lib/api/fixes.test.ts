/**
 * @jest-environment node
 */
import { removeFixVote, voteFix } from "./fixes";

const serverApiFetchMock = jest.fn();

jest.mock("./server-client", () => ({
  serverApiFetch: (...args: unknown[]) => serverApiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("voteFix", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("posts the vote and returns the updated fix", async () => {
    const fix = { id: "fix-1", likes: 4, dislikes: 0, myVote: "like" };
    serverApiFetchMock.mockResolvedValue(jsonResponse(fix));

    await expect(voteFix("fix-1", "like")).resolves.toEqual(fix);
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/fixes/fix-1/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: "like" }),
    });
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 403 }));

    await expect(voteFix("fix-1", "like")).rejects.toThrow(
      "Failed to vote on fix: 403"
    );
  });
});

describe("removeFixVote", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("deletes the vote", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(removeFixVote("fix-1")).resolves.toBeUndefined();
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/fixes/fix-1/vote", {
      method: "DELETE",
    });
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(removeFixVote("fix-1")).rejects.toThrow(
      "Failed to remove fix vote: 404"
    );
  });
});
