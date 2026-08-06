import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FixList } from "./fix-list";
import type { AdminFix } from "@/types/admin";

const dict: Record<string, string> = {
  "issueDetail.noFixes": "No fixes yet.",
  "issueDetail.addFix": "New fix",
  "fixForm.summary": "Summary",
  "fixForm.steps": "Steps",
  "fixForm.estimatedCostEur": "Estimated cost (EUR)",
  "common.edit": "Edit",
  "common.delete": "Delete",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.error": "Something went wrong. Please try again.",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => dict[key] ?? key,
}));

const createAdminFixMock = jest.fn();
const updateAdminFixMock = jest.fn();
const deleteAdminFixMock = jest.fn();

jest.mock("@/lib/api/admin-fixes", () => ({
  createAdminFix: (...args: unknown[]) => createAdminFixMock(...args),
  updateAdminFix: (...args: unknown[]) => updateAdminFixMock(...args),
  deleteAdminFix: (...args: unknown[]) => deleteAdminFixMock(...args),
}));

const fix: AdminFix = {
  id: "fix-1",
  knownIssueId: "ki-1",
  userId: null,
  summary: "Replace synchros",
  steps: "Remove gearbox and replace synchro rings.",
  estimatedCostEur: "450.00",
  source: "ai",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("FixList", () => {
  beforeEach(() => {
    createAdminFixMock.mockReset();
    updateAdminFixMock.mockReset();
    deleteAdminFixMock.mockReset();
  });

  it("shows an empty state when there are no fixes", () => {
    render(<FixList knownIssueId="ki-1" fixes={[]} />);

    expect(screen.getByText("No fixes yet.")).toBeInTheDocument();
  });

  it("renders existing fixes", () => {
    render(<FixList knownIssueId="ki-1" fixes={[fix]} />);

    expect(screen.getByText("Replace synchros")).toBeInTheDocument();
    expect(
      screen.getByText("Remove gearbox and replace synchro rings.")
    ).toBeInTheDocument();
  });

  it("adds a new fix through the inline form", async () => {
    const user = userEvent.setup();
    createAdminFixMock.mockResolvedValue({
      id: "fix-2",
      knownIssueId: "ki-1",
      userId: null,
      summary: "Check clutch fluid",
      steps: "Top up the reservoir.",
      estimatedCostEur: null,
      source: "ai",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    render(<FixList knownIssueId="ki-1" fixes={[]} />);

    await user.click(screen.getByRole("button", { name: "New fix" }));
    await user.type(screen.getByLabelText("Summary"), "Check clutch fluid");
    await user.type(screen.getByLabelText("Steps"), "Top up the reservoir.");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(createAdminFixMock).toHaveBeenCalledWith(
      expect.objectContaining({
        knownIssueId: "ki-1",
        summary: "Check clutch fluid",
        steps: "Top up the reservoir.",
      })
    );
    expect(await screen.findByText("Check clutch fluid")).toBeInTheDocument();
  });

  it("edits an existing fix", async () => {
    const user = userEvent.setup();
    updateAdminFixMock.mockResolvedValue({ ...fix, summary: "New summary" });
    render(<FixList knownIssueId="ki-1" fixes={[fix]} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const summaryInput = screen.getByLabelText("Summary");
    await user.clear(summaryInput);
    await user.type(summaryInput, "New summary");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(updateAdminFixMock).toHaveBeenCalledWith(
      "fix-1",
      expect.objectContaining({ summary: "New summary" })
    );
    expect(await screen.findByText("New summary")).toBeInTheDocument();
  });

  it("deletes a fix", async () => {
    const user = userEvent.setup();
    deleteAdminFixMock.mockResolvedValue(undefined);
    render(<FixList knownIssueId="ki-1" fixes={[fix]} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(deleteAdminFixMock).toHaveBeenCalledWith("fix-1");
    expect(await screen.findByText("No fixes yet.")).toBeInTheDocument();
  });
});
