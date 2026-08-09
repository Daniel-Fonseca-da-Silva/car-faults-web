/**
 * @jest-environment node
 */
import {
  createAdminKnownIssue,
  deleteAdminKnownIssue,
  updateAdminKnownIssue,
} from "./admin-known-issues";
import { getAdminKnownIssue } from "./admin-known-issues.server";

const apiFetchMock = jest.fn();
const serverApiFetchMock = jest.fn();

jest.mock("./client", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

jest.mock("./server-client", () => ({
  serverApiFetch: (...args: unknown[]) => serverApiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("getAdminKnownIssue", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("returns the known issue detail", async () => {
    const detail = { id: "ki-1", fixes: [] };
    serverApiFetchMock.mockResolvedValue(jsonResponse(detail));

    await expect(getAdminKnownIssue("ki-1")).resolves.toEqual(detail);
    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/admin/known-issues/ki-1"
    );
  });

  it("returns null on a 404 response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(getAdminKnownIssue("missing")).resolves.toBeNull();
  });

  it("throws on other error responses", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(getAdminKnownIssue("ki-1")).rejects.toThrow(
      "Failed to load known issue: 500"
    );
  });
});

describe("createAdminKnownIssue", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("posts the input and returns the created known issue", async () => {
    const input = {
      vehicleModelId: "vm-1",
      title: "Gearbox",
      description: "Wears out",
      severity: "high" as const,
    };
    const created = { id: "ki-1", ...input };
    apiFetchMock.mockResolvedValue(jsonResponse(created));

    await expect(createAdminKnownIssue(input)).resolves.toEqual(created);
    expect(apiFetchMock).toHaveBeenCalledWith("/v1/admin/known-issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  });

  it("throws on an error response", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(
      createAdminKnownIssue({
        vehicleModelId: "missing",
        title: "Gearbox",
        description: "Wears out",
        severity: "high",
      })
    ).rejects.toThrow("Failed to create known issue: 404");
  });
});

describe("updateAdminKnownIssue", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("patches the known issue and returns it", async () => {
    const updated = { id: "ki-1", title: "New title" };
    apiFetchMock.mockResolvedValue(jsonResponse(updated));

    await expect(
      updateAdminKnownIssue("ki-1", { title: "New title" })
    ).resolves.toEqual(updated);
    expect(apiFetchMock).toHaveBeenCalledWith("/v1/admin/known-issues/ki-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New title" }),
    });
  });

  it("throws on an error response", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(
      updateAdminKnownIssue("missing", { title: "x" })
    ).rejects.toThrow("Failed to update known issue: 404");
  });
});

describe("deleteAdminKnownIssue", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("deletes the known issue", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await deleteAdminKnownIssue("ki-1");

    expect(apiFetchMock).toHaveBeenCalledWith("/v1/admin/known-issues/ki-1", {
      method: "DELETE",
    });
  });

  it("throws on an error response", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(deleteAdminKnownIssue("missing")).rejects.toThrow(
      "Failed to delete known issue: 404"
    );
  });
});
