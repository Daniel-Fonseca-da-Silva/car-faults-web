import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { locales } from "@/i18n/locales";
import type { AdminKnownIssueDetail } from "@/types/admin";

import AdminIssueDetailPage, {
  generateMetadata,
  generateStaticParams,
} from "./page";

const requireAdminUserMock = jest.fn();
const getAdminKnownIssueMock = jest.fn();
const redirectMock = jest.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

jest.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { namespace: string }) => {
    const namespace = typeof arg === "string" ? arg : arg.namespace;
    return (key: string) => `${namespace}.${key}`;
  },
  setRequestLocale: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  redirect: (url: string) => redirectMock(url),
}));

jest.mock("@/lib/admin/require-admin-user", () => ({
  requireAdminUser: () => requireAdminUserMock(),
}));

jest.mock("@/lib/api/admin-known-issues", () => ({
  getAdminKnownIssue: (...args: unknown[]) => getAdminKnownIssueMock(...args),
}));

jest.mock("@/components/admin/known-issue-form", () => ({
  KnownIssueForm: ({
    vehicleModelId,
    knownIssue,
  }: {
    vehicleModelId: string;
    knownIssue?: { title: string };
  }) => (
    <div data-testid="known-issue-form">
      {vehicleModelId}:{knownIssue?.title}
    </div>
  ),
}));

jest.mock("@/components/admin/known-issue-delete-button", () => ({
  KnownIssueDeleteButton: ({ issueTitle }: { issueTitle: string }) => (
    <div data-testid="known-issue-delete-button">{issueTitle}</div>
  ),
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("@/components/admin/fix-list", () => ({
  FixList: ({
    knownIssueId,
    fixes,
  }: {
    knownIssueId: string;
    fixes: unknown[];
  }) => (
    <div data-testid="fix-list">
      {knownIssueId}:{fixes.length}
    </div>
  ),
}));

const issue: AdminKnownIssueDetail = {
  id: "issue-1",
  vehicleModelId: "veh-1",
  title: "Gearbox synchros wear out",
  description: "Synchros wear out prematurely.",
  severity: "high",
  locale: "en-GB",
  typicalKm: 120000,
  sources: null,
  aiGeneratedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  fixes: [
    {
      id: "fix-1",
      knownIssueId: "issue-1",
      userId: null,
      summary: "Replace the synchros",
      steps: "Remove gearbox, replace synchros, reassemble.",
      estimatedCostEur: "350",
      source: "user",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
};

describe("AdminIssueDetailPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to login when the user is not an admin", async () => {
    requireAdminUserMock.mockResolvedValue(null);

    await expect(
      AdminIssueDetailPage({
        params: Promise.resolve({ locale: "pt-PT", id: "issue-1" }),
      })
    ).rejects.toThrow("REDIRECT:/pt-PT/login");
    expect(getAdminKnownIssueMock).not.toHaveBeenCalled();
  });

  it("triggers a not-found response when the known issue does not exist", async () => {
    requireAdminUserMock.mockResolvedValue({ id: "u1", role: "admin" });
    getAdminKnownIssueMock.mockResolvedValue(null);

    await expect(
      AdminIssueDetailPage({
        params: Promise.resolve({ locale: "pt-PT", id: "missing" }),
      })
    ).rejects.toThrow();
  });

  it("renders the issue form, delete button and fixes", async () => {
    requireAdminUserMock.mockResolvedValue({ id: "u1", role: "admin" });
    getAdminKnownIssueMock.mockResolvedValue(issue);

    const jsx = await AdminIssueDetailPage({
      params: Promise.resolve({ locale: "pt-PT", id: "issue-1" }),
    });
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "Gearbox synchros wear out" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /admin.issueDetail.backToVehicle/ })
    ).toHaveAttribute("href", "/admin/vehicles/veh-1");
    expect(screen.getByTestId("known-issue-delete-button")).toHaveTextContent(
      "Gearbox synchros wear out"
    );
    expect(screen.getByTestId("known-issue-form")).toHaveTextContent(
      "veh-1:Gearbox synchros wear out"
    );
    expect(screen.getByTestId("fix-list")).toHaveTextContent("issue-1:1");
  });
});

describe("generateMetadata", () => {
  it("builds a localized title and description, and opts the page out of indexing", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT", id: "issue-1" }),
    });

    expect(metadata.title).toBe("seo.admin.title");
    expect(metadata.description).toBe("seo.admin.description");
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});

describe("generateStaticParams", () => {
  it("returns a param entry for every supported locale", () => {
    expect(generateStaticParams()).toEqual(
      locales.map((locale) => ({ locale }))
    );
  });
});
