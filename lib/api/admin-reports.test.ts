/**
 * @jest-environment node
 */
import { removeAdminReportContent, updateAdminReportStatus } from "./admin-reports";

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

describe("updateAdminReportStatus", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("patches the report status, revalidates the reports page, and returns the updated report", async () => {
    const updated = { id: "report-1", status: "reviewed" };
    serverApiFetchMock.mockResolvedValue(jsonResponse(updated));

    await expect(
      updateAdminReportStatus("report-1", "reviewed", { appLocale: "en-GB" })
    ).resolves.toEqual(updated);
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/admin/reports/report-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "reviewed" }),
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/en-GB/admin/reports");
  });

  it("throws on an error response without revalidating", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(
      updateAdminReportStatus("missing", "dismissed", { appLocale: "en-GB" })
    ).rejects.toThrow("Failed to update report: 404");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});

describe("removeAdminReportContent", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("deletes the reported content, revalidates the reports page, and returns the updated report", async () => {
    const updated = { id: "report-1", status: "reviewed", contentExists: false };
    serverApiFetchMock.mockResolvedValue(jsonResponse(updated));

    await expect(
      removeAdminReportContent("report-1", { appLocale: "en-GB" })
    ).resolves.toEqual(updated);
    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/admin/reports/report-1/content",
      { method: "DELETE" }
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/en-GB/admin/reports");
  });

  it("throws on an error response without revalidating", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(
      removeAdminReportContent("missing", { appLocale: "en-GB" })
    ).rejects.toThrow("Failed to remove reported content: 404");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
