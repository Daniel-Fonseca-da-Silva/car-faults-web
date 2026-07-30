import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { locales } from "@/i18n/locales";
import { vehicles } from "@/lib/mocks/vehicles";

import VehiclePage, {
  generateMetadata,
  generateStaticParams,
} from "./page";

jest.mock("@/lib/mocks/vehicles", () => {
  const actual: typeof import("@/lib/mocks/vehicles") = jest.requireActual(
    "@/lib/mocks/vehicles"
  );
  const extendedVehicles = [
    ...actual.vehicles,
    {
      makeSlug: "tesla",
      make: "Tesla",
      modelSlug: "model-3",
      model: "Model 3",
      year: 2022,
      doors: [4],
      engines: [
        {
          code: "EV",
          label: "Electric",
          fuel: "electric",
          displacementLitres: 0,
        },
      ],
      reportCount: 0,
      faults: [],
    },
  ];

  return {
    ...actual,
    vehicles: extendedVehicles,
    findVehicle: (makeSlug: string, modelSlug: string, year: number) =>
      extendedVehicles.find(
        (vehicle) =>
          vehicle.makeSlug === makeSlug &&
          vehicle.modelSlug === modelSlug &&
          vehicle.year === year
      ),
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

describe("VehiclePage", () => {
  it("renders the vehicle title, specs and known faults", async () => {
    const jsx = await VehiclePage({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "volkswagen",
        model: "golf",
        year: "2018",
      }),
    });
    render(jsx);

    expect(
      screen.getByRole("heading", { name: "Volkswagen Golf 2018", level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText("Timing chain tensioner wear")).toBeInTheDocument();
    expect(screen.getByText("DSG mechatronic failure")).toBeInTheDocument();
  });

  it("renders links to other model years", async () => {
    const jsx = await VehiclePage({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "volkswagen",
        model: "golf",
        year: "2018",
      }),
    });
    render(jsx);

    const link2019 = screen.getByRole("link", { name: "2019" });
    const link2020 = screen.getByRole("link", { name: "2020" });

    expect(link2019).toHaveAttribute("href", "/defects/volkswagen/golf/2019");
    expect(link2020).toHaveAttribute("href", "/defects/volkswagen/golf/2020");
  });

  it("shows a no-faults message and skips the FAQ structured data when the vehicle has none", async () => {
    const jsx = await VehiclePage({
      params: Promise.resolve({
        locale: "pt-PT",
        make: "tesla",
        model: "model-3",
        year: "2022",
      }),
    });
    render(jsx);

    expect(screen.getByText("faults.noFaults")).toBeInTheDocument();
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
        model: "golf",
        year: "2018",
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
  it("returns a param entry for every vehicle in every supported locale", () => {
    expect(generateStaticParams()).toEqual(
      locales.flatMap((locale) =>
        vehicles.map((vehicle) => ({
          locale,
          make: vehicle.makeSlug,
          model: vehicle.modelSlug,
          year: String(vehicle.year),
        }))
      )
    );
  });
});
