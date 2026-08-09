import { render, screen } from "@testing-library/react";

import { locales } from "@/i18n/locales";

import HomePage, { generateMetadata, generateStaticParams } from "./page";

const getDatabaseStatusMock = jest.fn();

jest.mock("@/lib/api/platform", () => ({
  getDatabaseStatus: () => getDatabaseStatusMock(),
}));

jest.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { namespace: string }) => {
    const namespace = typeof arg === "string" ? arg : arg.namespace;
    return (key: string) => `${namespace}.${key}`;
  },
  setRequestLocale: jest.fn(),
}));

jest.mock("@/components/home/hero-section", () => ({
  HeroSection: () => <div data-testid="hero-section" />,
}));
jest.mock("@/components/home/stats-bar", () => ({
  StatsBar: () => <div data-testid="stats-bar" />,
}));
jest.mock("@/components/home/vehicle-search-form", () => ({
  VehicleSearchForm: ({ isDatabaseUp }: { isDatabaseUp: boolean }) => (
    <div data-testid="vehicle-search-form" data-is-database-up={isDatabaseUp} />
  ),
}));

describe("HomePage", () => {
  beforeEach(() => {
    getDatabaseStatusMock.mockReset().mockResolvedValue(true);
  });

  it("renders all landing sections", async () => {
    const jsx = await HomePage({
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    expect(screen.getByTestId("vehicle-search-form")).toBeInTheDocument();
    expect(screen.getByTestId("stats-bar")).toBeInTheDocument();
  });

  it("passes the database status down to the search form", async () => {
    getDatabaseStatusMock.mockResolvedValue(false);

    const jsx = await HomePage({
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    expect(screen.getByTestId("vehicle-search-form")).toHaveAttribute(
      "data-is-database-up",
      "false"
    );
  });
});

describe("generateMetadata", () => {
  it("builds a localized title, description and language alternates", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT" }),
    });

    expect(metadata.title).toBe("seo.home.title");
    expect(metadata.description).toBe("seo.home.description");
    expect(metadata.alternates?.languages).toEqual({
      "pt-PT": "/pt-PT",
      "en-GB": "/en-GB",
      "es-ES": "/es-ES",
    });
  });
});

describe("generateStaticParams", () => {
  it("returns a param entry for every supported locale", () => {
    expect(generateStaticParams()).toEqual(
      locales.map((locale) => ({ locale }))
    );
  });
});
