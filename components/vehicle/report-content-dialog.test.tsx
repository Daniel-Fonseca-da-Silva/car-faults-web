import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ReportContentDialog } from "./report-content-dialog";
import { ReportConflictError } from "@/lib/api/report-errors";

const dict: Record<string, string> = {
  "vehicle.report.action": "Report",
  "vehicle.report.dialogTitle": "Report content",
  "vehicle.report.reason.spam": "Spam",
  "vehicle.report.reason.offensive": "Offensive or abusive",
  "vehicle.report.reason.inappropriate_photo": "Inappropriate photo",
  "vehicle.report.reason.harassment": "Harassment",
  "vehicle.report.reason.other": "Other",
  "vehicle.report.detailsPlaceholder": "Additional details (optional)",
  "vehicle.report.submit": "Submit report",
  "vehicle.report.cancel": "Cancel",
  "vehicle.report.close": "Close",
  "vehicle.report.success":
    "Report submitted. Thanks for helping keep the community safe.",
  "vehicle.report.duplicateError": "You've already reported this content.",
  "vehicle.report.submitError":
    "Couldn't submit the report. Please try again.",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => dict[key] ?? key,
}));

const createReportMock = jest.fn();

jest.mock("@/lib/api/reports", () => ({
  createReport: (...args: unknown[]) => createReportMock(...args),
}));

function createUser() {
  return userEvent.setup({ delay: null });
}

async function openDialog() {
  const user = createUser();
  render(<ReportContentDialog contentType="comment" contentId="comment-1" />);
  await user.click(screen.getByRole("button", { name: "Report" }));
  return user;
}

describe("ReportContentDialog", () => {
  afterEach(() => {
    createReportMock.mockReset();
  });

  it("opens the dialog and lists the report reasons", async () => {
    await openDialog();

    expect(
      screen.getByRole("heading", { name: "Report content" })
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Spam" })).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Offensive or abusive" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Inappropriate photo" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Harassment" })
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Other" })).toBeInTheDocument();
  });

  it("keeps the submit button disabled until a reason is chosen", async () => {
    const user = await openDialog();

    expect(screen.getByRole("button", { name: "Submit report" })).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: "Spam" }));

    expect(
      screen.getByRole("button", { name: "Submit report" })
    ).toBeEnabled();
  });

  it("submits the chosen reason with trimmed details and shows a success message", async () => {
    createReportMock.mockResolvedValue({ id: "report-1" });
    const user = await openDialog();

    await user.click(screen.getByRole("radio", { name: "Other" }));
    await user.type(
      screen.getByPlaceholderText("Additional details (optional)"),
      "  It's fake  "
    );
    await user.click(screen.getByRole("button", { name: "Submit report" }));

    await waitFor(() => {
      expect(createReportMock).toHaveBeenCalledWith({
        contentType: "comment",
        contentId: "comment-1",
        reason: "other",
        details: "It's fake",
      });
    });
    expect(
      await screen.findByText(
        "Report submitted. Thanks for helping keep the community safe."
      )
    ).toBeInTheDocument();
  });

  it("submits without details when none were entered", async () => {
    createReportMock.mockResolvedValue({ id: "report-1" });
    const user = await openDialog();

    await user.click(screen.getByRole("radio", { name: "Spam" }));
    await user.click(screen.getByRole("button", { name: "Submit report" }));

    await waitFor(() => {
      expect(createReportMock).toHaveBeenCalledWith({
        contentType: "comment",
        contentId: "comment-1",
        reason: "spam",
        details: undefined,
      });
    });
  });

  it("closes the dialog and resets its state from the success view", async () => {
    createReportMock.mockResolvedValue({ id: "report-1" });
    const user = await openDialog();

    await user.click(screen.getByRole("radio", { name: "Spam" }));
    await user.click(screen.getByRole("button", { name: "Submit report" }));
    await screen.findByText(
      "Report submitted. Thanks for helping keep the community safe."
    );

    const closeButton = screen
      .getAllByRole("button", { name: "Close" })
      .find((button) => button.dataset.slot !== "dialog-close");
    await user.click(closeButton!);

    expect(
      screen.queryByRole("heading", { name: "Report content" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Report" }));

    expect(
      screen.queryByText(
        "Report submitted. Thanks for helping keep the community safe."
      )
    ).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Spam" })).not.toBeChecked();
  });

  it("cancels the dialog without submitting a report", async () => {
    const user = await openDialog();

    await user.click(screen.getByRole("radio", { name: "Spam" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(createReportMock).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("heading", { name: "Report content" })
    ).not.toBeInTheDocument();
  });

  it("shows a duplicate-report error when the reason was already reported", async () => {
    createReportMock.mockRejectedValue(new ReportConflictError());
    const user = await openDialog();

    await user.click(screen.getByRole("radio", { name: "Spam" }));
    await user.click(screen.getByRole("button", { name: "Submit report" }));

    expect(
      await screen.findByText("You've already reported this content.")
    ).toBeInTheDocument();
  });

  it("shows a generic error when submitting the report fails", async () => {
    createReportMock.mockRejectedValue(new Error("network"));
    const user = await openDialog();

    await user.click(screen.getByRole("radio", { name: "Spam" }));
    await user.click(screen.getByRole("button", { name: "Submit report" }));

    expect(
      await screen.findByText("Couldn't submit the report. Please try again.")
    ).toBeInTheDocument();
  });

  it("shows a loading state while the report submits", async () => {
    let resolveSubmit: (result: { id: string }) => void = () => {};
    createReportMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        })
    );
    const user = await openDialog();

    await user.click(screen.getByRole("radio", { name: "Spam" }));
    await user.click(screen.getByRole("button", { name: "Submit report" }));

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    resolveSubmit({ id: "report-1" });

    await screen.findByText(
      "Report submitted. Thanks for helping keep the community safe."
    );
  });
});
