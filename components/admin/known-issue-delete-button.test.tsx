import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { KnownIssueDeleteButton } from "./known-issue-delete-button";

const dict: Record<string, string> = {
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "issueDetail.deleteIssue": "Delete known issue",
  "issueDetail.deleteConfirmTitle": "Delete this known issue?",
  "issueDetail.deleteConfirmDescription":
    'This removes "{issue}" and its fixes. This cannot be undone from here.',
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    const template = dict[key] ?? key;
    return values
      ? template.replace(/\{(\w+)\}/g, (_, token) => String(values[token]))
      : template;
  },
}));

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

const deleteAdminKnownIssueMock = jest.fn();

jest.mock("@/lib/api/admin-known-issues", () => ({
  deleteAdminKnownIssue: (...args: unknown[]) =>
    deleteAdminKnownIssueMock(...args),
}));

describe("KnownIssueDeleteButton", () => {
  beforeEach(() => {
    pushMock.mockClear();
    refreshMock.mockClear();
    deleteAdminKnownIssueMock.mockReset();
    deleteAdminKnownIssueMock.mockResolvedValue(undefined);
  });

  it("opens a confirmation dialog before deleting the known issue", async () => {
    const user = userEvent.setup();
    render(
      <KnownIssueDeleteButton
        knownIssueId="ki-1"
        vehicleModelId="vm-1"
        issueTitle="Problematic gearbox"
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Delete known issue" })
    );

    expect(screen.getByText("Delete this known issue?")).toBeInTheDocument();
    expect(
      screen.getByText(
        'This removes "Problematic gearbox" and its fixes. This cannot be undone from here.'
      )
    ).toBeInTheDocument();
  });

  it("deletes the known issue and navigates back to the vehicle when confirmed", async () => {
    const user = userEvent.setup();
    render(
      <KnownIssueDeleteButton
        knownIssueId="ki-1"
        vehicleModelId="vm-1"
        issueTitle="Problematic gearbox"
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Delete known issue" })
    );
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(deleteAdminKnownIssueMock).toHaveBeenCalledWith("ki-1");
    expect(pushMock).toHaveBeenCalledWith("/admin/vehicles/vm-1");
    expect(refreshMock).toHaveBeenCalled();
  });
});
