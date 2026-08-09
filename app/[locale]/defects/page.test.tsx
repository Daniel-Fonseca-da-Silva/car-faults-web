import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { locales } from "@/i18n/locales";
import type { TopFaultEntry } from "@/types/vehicle";

import DefectsHubPage, {
  generateMetadata,
  generateStaticParams,
} from "./page";

const getPlatformFaultsMock = jest.fn();

jest.mock("@/lib/api/platform", () => ({
  getPlatformFaults: (...args: unknown[]) => getPlatformFaultsMock(...args),
}));

jest.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { namespace: string }) => {
    const namespace = typeof arg === "string" ? arg : arg.namespace;
    return (key: string, values?: Record<string, unknown>) => {
      if (key === "resultsFor") return `Results for "${values?.query}"`;
      if (key === "pageInfo")
        return `Page ${values?.page} of ${values?.totalPages}`;
      return `${namespace}.${key}`;
    };
  },
  setRequestLocale: jest.fn(),
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

// FaultCardGrid renders the async FaultCard server component as an
// un-awaited JSX child. react-dom's client renderer can't resolve that
// (no Suspense boundary), so it's mocked here — the grid itself is
// covered separately in fault-card-grid.test.tsx.
jest.mock("@/components/faults/fault-card-grid", () => ({
  FaultCardGrid: ({ entries }: { entries: unknown[] }) => (
    <div data-testid="fault-card-grid">{entries.length}</div>
  ),
}));

const entries: TopFaultEntry[] = [
  {
    id: "top-1",
    vehicle: {
      make: "Volkswagen",
      model: "Golf",
      year: 2015,
      engine: "1.6 TDI",
      fuelType: "diesel",
    },
    faultTitle: "Timing chain tensioner wear",
    severity: "high",
    reportCount: 412,
  },
];

describe("DefectsHubPage", () => {
  afterEach(() => {
    getPlatformFaultsMock.mockReset();
  });

  it("renders the hub title and subtitle when there is no query", async () => {
    getPlatformFaultsMock.mockResolvedValue({
      items: entries,
      total: 1,
      page: 1,
      limit: 9,
    });

    const jsx = await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "faults.hub.title" })
    ).toBeInTheDocument();
    expect(screen.getByText("faults.hub.subtitle")).toBeInTheDocument();
  });

  it("fetches faults for the current locale, defaulting to page 1 and a limit of 9", async () => {
    getPlatformFaultsMock.mockResolvedValue({
      items: entries,
      total: 1,
      page: 1,
      limit: 9,
    });

    await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });

    expect(getPlatformFaultsMock).toHaveBeenCalledWith({
      locale: "pt-PT",
      page: 1,
      limit: 9,
      brand: undefined,
      model: undefined,
      year: undefined,
      fuelType: undefined,
      doors: undefined,
    });
  });

  it("maps the make/fuel search params to brand/fuelType filters and shows the query summary", async () => {
    getPlatformFaultsMock.mockResolvedValue({
      items: entries,
      total: 1,
      page: 1,
      limit: 9,
    });

    const jsx = await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({
        make: "volkswagen",
        model: "golf",
        year: "2018",
        fuel: "diesel",
        doors: "5",
      }),
    });
    render(jsx);

    expect(getPlatformFaultsMock).toHaveBeenCalledWith({
      locale: "pt-PT",
      page: 1,
      limit: 9,
      brand: "volkswagen",
      model: "golf",
      year: 2018,
      fuelType: "diesel",
      doors: 5,
    });
    expect(
      screen.getByText('Results for "volkswagen golf 2018"')
    ).toBeInTheDocument();
    expect(screen.getByTestId("fault-card-grid")).toHaveTextContent("1");
  });

  it("passes the requested page through to getPlatformFaults", async () => {
    getPlatformFaultsMock.mockResolvedValue({
      items: entries,
      total: 20,
      page: 2,
      limit: 9,
    });

    await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({ page: "2" }),
    });

    expect(getPlatformFaultsMock).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 })
    );
  });

  it("shows the empty message when there are no defects reported", async () => {
    getPlatformFaultsMock.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 9,
    });

    const jsx = await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });
    render(jsx);

    expect(screen.getByText("faults.hub.empty")).toBeInTheDocument();
    expect(screen.queryByTestId("fault-card-grid")).not.toBeInTheDocument();
  });

  it("shows the empty message when the filters match nothing", async () => {
    getPlatformFaultsMock.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 9,
    });

    const jsx = await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({ make: "tesla" }),
    });
    render(jsx);

    expect(screen.getByText("faults.hub.empty")).toBeInTheDocument();
  });

  it("hides pagination controls when the total fits on one page", async () => {
    getPlatformFaultsMock.mockResolvedValue({
      items: entries,
      total: 1,
      page: 1,
      limit: 9,
    });

    const jsx = await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });
    render(jsx);

    expect(
      screen.queryByRole("button", { name: "faults.hub.previous" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "faults.hub.next" })
    ).not.toBeInTheDocument();
  });

  it("shows pagination controls and disables previous on the first page when there is more than one page", async () => {
    getPlatformFaultsMock.mockResolvedValue({
      items: entries,
      total: 20,
      page: 1,
      limit: 9,
    });

    const jsx = await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });
    render(jsx);

    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "faults.hub.previous" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "faults.hub.next" })
    ).toHaveAttribute("href", "/defects?page=2");
  });

  it("disables next on the last page", async () => {
    getPlatformFaultsMock.mockResolvedValue({
      items: entries,
      total: 20,
      page: 3,
      limit: 9,
    });

    const jsx = await DefectsHubPage({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({ page: "3" }),
    });
    render(jsx);

    expect(
      screen.getByRole("button", { name: "faults.hub.next" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "faults.hub.previous" })
    ).toHaveAttribute("href", "/defects?page=2");
  });
});

describe("generateMetadata", () => {
  it("builds a localized title and description", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.title).toBe("seo.defectsHub.title");
    expect(metadata.description).toBe("seo.defectsHub.description");
  });
});

describe("generateStaticParams", () => {
  it("returns a param entry for every supported locale", () => {
    expect(generateStaticParams()).toEqual(
      locales.map((locale) => ({ locale }))
    );
  });
});
