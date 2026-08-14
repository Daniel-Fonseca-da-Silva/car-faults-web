/**
 * @jest-environment node
 */
import {
  createAdminKnownIssue,
  deleteAdminKnownIssue,
  updateAdminKnownIssue,
} from "./admin-known-issues";
import { getAdminKnownIssue } from "./admin-known-issues.server";

const serverApiFetchMock = jest.fn();
const revalidatePathMock = jest.fn();

jest.mock("./server-client", () => ({
  serverApiFetch: (...args: unknown[]) => serverApiFetchMock(...args),
}));

jest.mock("next/cache", () => ({
  revalidatePath: (path: string) => revalidatePathMock(path),
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
    serverApiFetchMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("posts the input, revalidates the vehicle page, and returns the created known issue", async () => {
    const input = {
      vehicleModelId: "vm-1",
      title: "Gearbox",
      description: "Wears out",
      severity: "high" as const,
    };
    const created = { id: "ki-1", ...input };
    serverApiFetchMock.mockResolvedValue(jsonResponse(created));

    await expect(
      createAdminKnownIssue(input, { appLocale: "en-GB" })
    ).resolves.toEqual(created);
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/admin/known-issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      "/en-GB/admin/vehicles/vm-1"
    );
  });

  it("throws on an error response without revalidating", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(
      createAdminKnownIssue(
        {
          vehicleModelId: "missing",
          title: "Gearbox",
          description: "Wears out",
          severity: "high",
        },
        { appLocale: "en-GB" }
      )
    ).rejects.toThrow("Failed to create known issue: 404");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});

describe("updateAdminKnownIssue", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("patches the known issue and returns it", async () => {
    const updated = { id: "ki-1", title: "New title" };
    serverApiFetchMock.mockResolvedValue(jsonResponse(updated));

    await expect(
      updateAdminKnownIssue("ki-1", { title: "New title" })
    ).resolves.toEqual(updated);
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/admin/known-issues/ki-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New title" }),
    });
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(
      updateAdminKnownIssue("missing", { title: "x" })
    ).rejects.toThrow("Failed to update known issue: 404");
  });
});

describe("deleteAdminKnownIssue", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("deletes the known issue and revalidates the vehicle page", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await deleteAdminKnownIssue("ki-1", {
      appLocale: "en-GB",
      vehicleModelId: "vm-1",
    });

    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/admin/known-issues/ki-1", {
      method: "DELETE",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      "/en-GB/admin/vehicles/vm-1"
    );
  });

  it("throws on an error response without revalidating", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(
      deleteAdminKnownIssue("missing", {
        appLocale: "en-GB",
        vehicleModelId: "vm-1",
      })
    ).rejects.toThrow("Failed to delete known issue: 404");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
