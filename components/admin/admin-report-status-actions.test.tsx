import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AdminReportStatusActions } from "./admin-report-status-actions";

const dict: Record<string, string> = {
  "common.error": "Something went wrong. Please try again.",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "reports.markReviewed": "Mark reviewed",
  "reports.dismiss": "Dismiss",
  "reports.removeContent": "Remove content",
  "reports.removeContentConfirmTitle": "Remove this content?",
  "reports.removeContentConfirmDescription":
    "This deletes the reported comment or review and marks the report as reviewed. This cannot be undone from here.",
  "reports.contentAlreadyRemoved": "This content was already removed.",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => dict[key] ?? key,
  useLocale: () => "en-GB",
}));

const updateAdminReportStatusMock = jest.fn();
const removeAdminReportContentMock = jest.fn();

jest.mock("@/lib/api/admin-reports", () => ({
  updateAdminReportStatus: (...args: unknown[]) =>
    updateAdminReportStatusMock(...args),
  removeAdminReportContent: (...args: unknown[]) =>
    removeAdminReportContentMock(...args),
}));

describe("AdminReportStatusActions", () => {
  const onResolved = jest.fn();

  beforeEach(() => {
    onResolved.mockClear();
    updateAdminReportStatusMock.mockReset();
    removeAdminReportContentMock.mockReset();
  });

  it("marks the report as reviewed and notifies the parent", async () => {
    updateAdminReportStatusMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <AdminReportStatusActions
        reportId="report-1"
        contentExists
        onResolved={onResolved}
      />
    );

    await user.click(screen.getByRole("button", { name: "Mark reviewed" }));

    expect(updateAdminReportStatusMock).toHaveBeenCalledWith(
      "report-1",
      "reviewed",
      { appLocale: "en-GB" }
    );
    expect(onResolved).toHaveBeenCalledWith("report-1");
  });

  it("dismisses the report and notifies the parent", async () => {
    updateAdminReportStatusMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <AdminReportStatusActions
        reportId="report-1"
        contentExists
        onResolved={onResolved}
      />
    );

    await user.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(updateAdminReportStatusMock).toHaveBeenCalledWith(
      "report-1",
      "dismissed",
      { appLocale: "en-GB" }
    );
    expect(onResolved).toHaveBeenCalledWith("report-1");
  });

  it("shows an error and does not notify the parent when the update fails", async () => {
    updateAdminReportStatusMock.mockRejectedValue(new Error("failed"));
    const user = userEvent.setup();
    render(
      <AdminReportStatusActions
        reportId="report-1"
        contentExists
        onResolved={onResolved}
      />
    );

    await user.click(screen.getByRole("button", { name: "Mark reviewed" }));

    expect(
      await screen.findByText("Something went wrong. Please try again.")
    ).toBeInTheDocument();
    expect(onResolved).not.toHaveBeenCalled();
  });

  it("opens a confirmation dialog before removing the content", async () => {
    const user = userEvent.setup();
    render(
      <AdminReportStatusActions
        reportId="report-1"
        contentExists
        onResolved={onResolved}
      />
    );

    await user.click(screen.getByRole("button", { name: "Remove content" }));

    expect(screen.getByText("Remove this content?")).toBeInTheDocument();
    expect(removeAdminReportContentMock).not.toHaveBeenCalled();
  });

  it("removes the content and notifies the parent when confirmed", async () => {
    removeAdminReportContentMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <AdminReportStatusActions
        reportId="report-1"
        contentExists
        onResolved={onResolved}
      />
    );

    await user.click(screen.getByRole("button", { name: "Remove content" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(removeAdminReportContentMock).toHaveBeenCalledWith("report-1", {
      appLocale: "en-GB",
    });
    expect(onResolved).toHaveBeenCalledWith("report-1");
  });

  it("shows an error and keeps the dialog open when removal fails", async () => {
    removeAdminReportContentMock.mockRejectedValue(new Error("failed"));
    const user = userEvent.setup();
    render(
      <AdminReportStatusActions
        reportId="report-1"
        contentExists
        onResolved={onResolved}
      />
    );

    await user.click(screen.getByRole("button", { name: "Remove content" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(
      await screen.findByText("Something went wrong. Please try again.")
    ).toBeInTheDocument();
    expect(onResolved).not.toHaveBeenCalled();
    expect(screen.getByText("Remove this content?")).toBeInTheDocument();
  });

  it("disables the remove content action when the content no longer exists", () => {
    render(
      <AdminReportStatusActions
        reportId="report-1"
        contentExists={false}
        onResolved={onResolved}
      />
    );

    expect(
      screen.getByRole("button", { name: "Remove content" })
    ).toBeDisabled();
  });
});
