import { render, screen } from "@testing-library/react";

import { locales } from "@/i18n/locales";
import type { AdminReport } from "@/types/admin";

import AdminReportsPage, {
  generateMetadata,
  generateStaticParams,
} from "./page";

const requireAdminUserMock = jest.fn();
const getAdminReportsMock = jest.fn();
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
  redirect: (url: string) => redirectMock(url),
}));

jest.mock("@/lib/admin/require-admin-user", () => ({
  requireAdminUser: () => requireAdminUserMock(),
}));

jest.mock("@/lib/api/admin-reports.server", () => ({
  getAdminReports: (...args: unknown[]) => getAdminReportsMock(...args),
}));

jest.mock("@/components/admin/admin-reports-table", () => ({
  AdminReportsTable: ({
    initialItems,
    initialCursor,
  }: {
    initialItems: AdminReport[];
    initialCursor: string | null;
  }) => (
    <div data-testid="admin-reports-table">
      {initialItems.map((report) => report.id).join(",")}:
      {initialCursor ?? "end"}
    </div>
  ),
}));

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
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("AdminReportsPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to login when the user is not an admin", async () => {
    requireAdminUserMock.mockResolvedValue(null);

    await expect(
      AdminReportsPage({
        params: Promise.resolve({ locale: "pt-PT" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("REDIRECT:/pt-PT/login");
    expect(getAdminReportsMock).not.toHaveBeenCalled();
  });

  it("renders the report table and forwards the status filter to the loader", async () => {
    requireAdminUserMock.mockResolvedValue({ id: "u1", role: "admin" });
    getAdminReportsMock.mockResolvedValue({
      items: [report],
      nextCursor: "c2",
    });

    const jsx = await AdminReportsPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({ status: "pending" }),
    });
    render(jsx);

    expect(getAdminReportsMock).toHaveBeenCalledWith({
      limit: 20,
      status: "pending",
    });
    expect(screen.getByTestId("admin-reports-table")).toHaveTextContent(
      "report-1:c2"
    );
  });

  it("shows the empty table state when there are no reports", async () => {
    requireAdminUserMock.mockResolvedValue({ id: "u1", role: "admin" });
    getAdminReportsMock.mockResolvedValue({
      items: [],
      nextCursor: null,
    });

    const jsx = await AdminReportsPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });
    render(jsx);

    expect(screen.getByTestId("admin-reports-table")).toHaveTextContent(
      ":end"
    );
  });
});

describe("generateMetadata", () => {
  it("builds a localized title and description, and opts the page out of indexing", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
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
