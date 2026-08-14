/**
 * @jest-environment node
 */
import { createAdminFix, deleteAdminFix, updateAdminFix } from "./admin-fixes";

const serverApiFetchMock = jest.fn();

jest.mock("./server-client", () => ({
  serverApiFetch: (...args: unknown[]) => serverApiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("createAdminFix", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("posts the input and returns the created fix", async () => {
    const input = {
      knownIssueId: "ki-1",
      summary: "Replace synchros",
      steps: "Remove gearbox.",
    };
    const created = { id: "fix-1", ...input, userId: null, source: "ai" };
    serverApiFetchMock.mockResolvedValue(jsonResponse(created));

    await expect(createAdminFix(input)).resolves.toEqual(created);
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/admin/fixes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(
      createAdminFix({
        knownIssueId: "missing",
        summary: "x",
        steps: "y",
      })
    ).rejects.toThrow("Failed to create fix: 404");
  });
});

describe("updateAdminFix", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("patches the fix and returns it", async () => {
    const updated = { id: "fix-1", summary: "Updated summary" };
    serverApiFetchMock.mockResolvedValue(jsonResponse(updated));

    await expect(
      updateAdminFix("fix-1", { summary: "Updated summary" })
    ).resolves.toEqual(updated);
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/admin/fixes/fix-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary: "Updated summary" }),
    });
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(
      updateAdminFix("missing", { summary: "x" })
    ).rejects.toThrow("Failed to update fix: 404");
  });
});

describe("deleteAdminFix", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("deletes the fix", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await deleteAdminFix("fix-1");

    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/admin/fixes/fix-1", {
      method: "DELETE",
    });
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(deleteAdminFix("missing")).rejects.toThrow(
      "Failed to delete fix: 404"
    );
  });
});
