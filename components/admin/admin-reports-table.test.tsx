import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { AdminReport } from "@/types/admin";

import { AdminReportsTable } from "./admin-reports-table";

jest.mock("next-intl", () => ({
  useLocale: () => "en-GB",
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

jest.mock("@/components/admin/admin-report-status-actions", () => ({
  AdminReportStatusActions: ({
    reportId,
    onResolved,
  }: {
    reportId: string;
    onResolved: (id: string) => void;
  }) => (
    <button type="button" onClick={() => onResolved(reportId)}>
      resolve-{reportId}
    </button>
  ),
}));

const now = new Date("2026-07-17T12:00:00.000Z");

const report: AdminReport = {
  id: "report-1",
  reporterUserId: "user-1",
  contentType: "comment",
  contentId: "comment-1",
  contentPreview: "Buy cheap watches now",
  contentExists: true,
  reason: "spam",
  details: null,
  status: "pending",
  createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
};

describe("AdminReportsTable", () => {
  it("renders the empty state when there are no reports", () => {
    render(<AdminReportsTable initialItems={[]} initialCursor={null} />);

    expect(screen.getByText("admin.reports.empty")).toBeInTheDocument();
  });

  it("renders a row for each report", () => {
    render(
      <AdminReportsTable initialItems={[report]} initialCursor={null} />
    );

    expect(screen.getByText("admin.reports.contentType.comment")).toBeInTheDocument();
    expect(screen.getByText("Buy cheap watches now")).toBeInTheDocument();
    expect(screen.getByText("admin.reports.reason.spam")).toBeInTheDocument();
    expect(screen.getByText("admin.reports.status.pending")).toBeInTheDocument();
  });

  it("shows the content-deleted fallback when there is no preview", () => {
    render(
      <AdminReportsTable
        initialItems={[{ ...report, contentPreview: null }]}
        initialCursor={null}
      />
    );

    expect(
      screen.getByText("admin.reports.contentDeleted")
    ).toBeInTheDocument();
  });

  it("removes a report from the list once it is resolved", async () => {
    const user = userEvent.setup();
    render(
      <AdminReportsTable initialItems={[report]} initialCursor={null} />
    );

    await user.click(screen.getByRole("button", { name: "resolve-report-1" }));

    expect(screen.getByText("admin.reports.empty")).toBeInTheDocument();
  });
});
