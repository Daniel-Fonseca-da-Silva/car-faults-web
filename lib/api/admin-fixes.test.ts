/**
 * @jest-environment node
 */
import { createAdminFix, deleteAdminFix, updateAdminFix } from "./admin-fixes";

const apiFetchMock = jest.fn();

jest.mock("./client", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("createAdminFix", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("posts the input and returns the created fix", async () => {
    const input = {
      knownIssueId: "ki-1",
      summary: "Replace synchros",
      steps: "Remove gearbox.",
    };
    const created = { id: "fix-1", ...input, userId: null, source: "ai" };
    apiFetchMock.mockResolvedValue(jsonResponse(created));

    await expect(createAdminFix(input)).resolves.toEqual(created);
    expect(apiFetchMock).toHaveBeenCalledWith("/v1/admin/fixes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  });

  it("throws on an error response", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

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
    apiFetchMock.mockReset();
  });

  it("patches the fix and returns it", async () => {
    const updated = { id: "fix-1", summary: "Updated summary" };
    apiFetchMock.mockResolvedValue(jsonResponse(updated));

    await expect(
      updateAdminFix("fix-1", { summary: "Updated summary" })
    ).resolves.toEqual(updated);
    expect(apiFetchMock).toHaveBeenCalledWith("/v1/admin/fixes/fix-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary: "Updated summary" }),
    });
  });

  it("throws on an error response", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(
      updateAdminFix("missing", { summary: "x" })
    ).rejects.toThrow("Failed to update fix: 404");
  });
});

describe("deleteAdminFix", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("deletes the fix", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await deleteAdminFix("fix-1");

    expect(apiFetchMock).toHaveBeenCalledWith("/v1/admin/fixes/fix-1", {
      method: "DELETE",
    });
  });

  it("throws on an error response", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(deleteAdminFix("missing")).rejects.toThrow(
      "Failed to delete fix: 404"
    );
  });
});
