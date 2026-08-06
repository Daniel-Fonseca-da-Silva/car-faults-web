import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { KnownIssueForm } from "./known-issue-form";
import type { AdminKnownIssue } from "@/types/admin";

const dict: Record<string, string> = {
  "issueForm.title": "Title",
  "issueForm.description": "Description",
  "issueForm.severity": "Severity",
  "issueForm.severityLow": "Low",
  "issueForm.severityMedium": "Medium",
  "issueForm.severityHigh": "High",
  "issueForm.severityCritical": "Critical",
  "issueForm.locale": "Locale",
  "issueForm.typicalKm": "Typical mileage (km)",
  "issueForm.sources": "Sources",
  "issueForm.sourcesHint": "One URL per line.",
  "common.save": "Save",
  "common.saving": "Saving…",
  "common.create": "Create",
  "common.creating": "Creating…",
  "common.error": "Something went wrong. Please try again.",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => dict[key] ?? key,
}));

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

const createAdminKnownIssueMock = jest.fn();
const updateAdminKnownIssueMock = jest.fn();

jest.mock("@/lib/api/admin-known-issues", () => ({
  createAdminKnownIssue: (...args: unknown[]) =>
    createAdminKnownIssueMock(...args),
  updateAdminKnownIssue: (...args: unknown[]) =>
    updateAdminKnownIssueMock(...args),
}));

const knownIssue: AdminKnownIssue = {
  id: "ki-1",
  vehicleModelId: "vm-1",
  title: "Problematic gearbox",
  description: "Synchros wear out.",
  severity: "high",
  locale: "en-GB",
  typicalKm: 120000,
  sources: ["https://example.com"],
  aiGeneratedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("KnownIssueForm", () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    createAdminKnownIssueMock.mockReset();
    updateAdminKnownIssueMock.mockReset();
  });

  it("creates a known issue for the given vehicle model and navigates to it", async () => {
    const user = userEvent.setup();
    createAdminKnownIssueMock.mockResolvedValue({ id: "ki-new" });
    render(<KnownIssueForm vehicleModelId="vm-1" />);

    await user.type(screen.getByLabelText("Title"), "Problematic gearbox");
    await user.type(
      screen.getByLabelText("Description"),
      "Synchros wear out."
    );
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(createAdminKnownIssueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        vehicleModelId: "vm-1",
        title: "Problematic gearbox",
        description: "Synchros wear out.",
      })
    );
    expect(pushMock).toHaveBeenCalledWith("/admin/issues/ki-new");
  });

  it("pre-fills the form with an existing known issue and updates it", async () => {
    const user = userEvent.setup();
    updateAdminKnownIssueMock.mockResolvedValue({ id: "ki-1" });
    render(<KnownIssueForm vehicleModelId="vm-1" knownIssue={knownIssue} />);

    expect(screen.getByLabelText("Title")).toHaveValue("Problematic gearbox");
    expect(screen.getByLabelText("Typical mileage (km)")).toHaveValue(120000);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(updateAdminKnownIssueMock).toHaveBeenCalledWith(
      "ki-1",
      expect.objectContaining({ title: "Problematic gearbox" })
    );
    expect(pushMock).toHaveBeenCalledWith("/admin/issues/ki-1");
  });
});
