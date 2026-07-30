import { render, screen } from "@testing-library/react";
import Link from "next/link";

import { locales } from "@/i18n/locales";
import type { LookupFuelType } from "@/types/lookup";

import VehiclePage, {
  generateMetadata,
  generateStaticParams,
} from "./page";

jest.mock("@/lib/mocks/lookup-results", () => {
  const actual: typeof import("@/lib/mocks/lookup-results") = jest.requireActual(
    "@/lib/mocks/lookup-results"
  );

  const noIssuesVehicle = {
    vehicle: {
      id: "veh-tesla-model-3",
      brand: "Tesla",
      model: "Model 3",
      name: null,
      yearFrom: 2022,
      yearTo: 2022,
      engine: "Electric",
      doors: 4,
      fuelType: "electric" as LookupFuelType,
      imageUrl: null,
      techSpecs: { power_hp: 283 },
    },
    knownIssues: [],
  };

  const extendedResults = [...actual.lookupResults, noIssuesVehicle];

  function slug(value: string): string {
    return value.toLowerCase().replace(/\s+/g, "-");
  }

  return {
    ...actual,
    lookupResults: extendedResults,
    findLookup: (makeSlug: string, modelSlug: string, year: number) =>
      extendedResults.find((result) => {
        const vehicleYearTo = result.vehicle.yearTo ?? result.vehicle.yearFrom;
        return (
          slug(result.vehicle.brand) === makeSlug &&
          slug(result.vehicle.model) === modelSlug &&
          year >= result.vehicle.yearFrom &&
          year <= vehicleYearTo
        );
      }),
  };
});

jest.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { namespace: string }) => {
    const namespace = typeof arg === "string" ? arg : arg.namespace;
    return (key: string, values?: Record<string, unknown>) => {
      if (values) {
        return `${namespace}.${key}(${JSON.stringify(values)})`;
      }
      return `${namespace}.${key}`;
    };
  },
  setRequestLocale: jest.fn(),
}));

jest.mock("@/components/vehicle/vehicle-hero", () => ({
  VehicleHero: ({ vehicle }: { vehicle: { brand: string; model: string } }) => (
    <div data-testid="vehicle-hero">
      {vehicle.brand} {vehicle.model}
    </div>
  ),
}));

jest.mock("@/components/vehicle/vehicle-tech-specs", () => ({
  VehicleTechSpecs: ({ vehicle }: { vehicle: { engine: string } }) => (
    <div data-testid="vehicle-tech-specs">{vehicle.engine}</div>
  ),
}));

jest.mock("@/components/vehicle/known-issues-summary", () => ({
  KnownIssuesSummary: ({ total }: { total: number }) => (
    <div data-testid="known-issues-summary">{total}</div>
  ),
}));

jest.mock("@/components/vehicle/known-issues-accordion", () => ({
  KnownIssuesAccordion: ({ knownIssues }: { knownIssues: unknown[] }) => (
    <div data-testid="known-issues-accordion">{knownIssues.length}</div>
  ),
}));

jest.mock("@/components/vehicle/vehicle-back-link", () => ({
  VehicleBackLink: () => <Link href="/">Nova busca</Link>,
}));

describe("VehiclePage", () => {
  it("renders the hero, specs, summary and known issues for a matching vehicle", async () => {
    const jsx = await VehiclePage({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "volkswagen",
        model: "polo",
        year: "1996",
      }),
    });
    render(jsx);

    expect(screen.getByTestId("vehicle-hero")).toHaveTextContent(
      "Volkswagen Polo"
    );
    expect(screen.getByTestId("vehicle-tech-specs")).toHaveTextContent("1.0");
    expect(screen.getByTestId("known-issues-summary")).toHaveTextContent("2");
    expect(screen.getByTestId("known-issues-accordion")).toHaveTextContent(
      "2"
    );
    expect(screen.getByRole("link", { name: "Nova busca" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(
      document.querySelectorAll('script[type="application/ld+json"]')
    ).toHaveLength(2);
  });

  it("shows a no-known-issues message and skips the FAQ structured data when there are none", async () => {
    const jsx = await VehiclePage({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "tesla",
        model: "model-3",
        year: "2022",
      }),
    });
    render(jsx);

    expect(
      screen.getByText("faults.vehicle.noKnownIssues")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("known-issues-accordion")).not.toBeInTheDocument();
    expect(
      document.querySelectorAll('script[type="application/ld+json"]')
    ).toHaveLength(1);
  });

  it("triggers a not-found response for an unknown vehicle", async () => {
    await expect(
      VehiclePage({
        params: Promise.resolve({
          locale: "pt-PT",
          make: "tesla",
          model: "model-3",
          year: "2018",
        }),
      })
    ).rejects.toThrow();
  });
});

describe("generateMetadata", () => {
  it("builds a localized title and description for a known vehicle", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "volkswagen",
        model: "polo",
        year: "1996",
      }),
    });

    expect(metadata.title).toContain("seo.vehiclePage.titleTemplate");
    expect(metadata.description).toContain(
      "seo.vehiclePage.descriptionTemplate"
    );
  });

  it("returns an empty object for an unknown vehicle", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "tesla",
        model: "model-3",
        year: "2018",
      }),
    });

    expect(metadata).toEqual({});
  });
});

describe("generateStaticParams", () => {
  it("returns a param entry for every year of every vehicle in every supported locale", () => {
    const { listLookupStaticParams } = jest.requireActual(
      "@/lib/mocks/lookup-results"
    ) as typeof import("@/lib/mocks/lookup-results");

    expect(generateStaticParams()).toEqual(
      locales.flatMap((locale) =>
        listLookupStaticParams().map((paramSet) => ({
          locale,
          ...paramSet,
        }))
      )
    );
  });
});
