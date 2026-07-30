import { slugify } from "@/lib/utils";
import type {
  IssueSeverity,
  KnownIssue,
  LookupResponse,
} from "@/types/lookup";

export const lookupResults: LookupResponse[] = [
  {
    vehicle: {
      id: "veh-polo-6n1",
      brand: "Volkswagen",
      model: "Polo",
      name: "Polo 6N1",
      yearFrom: 1994,
      yearTo: 1999,
      engine: "1.0",
      doors: 3,
      fuelType: "gasoline",
      imageUrl: null,
      techSpecs: { power_hp: 50 },
    },
    knownIssues: [
      {
        id: "polo-6n1-gearbox-synchros",
        title: "Problematic gearbox",
        description:
          "Synchros wear out prematurely under normal use, causing grinding noises and difficulty engaging second and third gear.",
        severity: "high",
        typicalKm: 120000,
        sources: ["https://example.com/polo-gearbox-forum"],
        fixes: [
          {
            id: "fix-polo-gearbox-1",
            knownIssueId: "polo-6n1-gearbox-synchros",
            summary: "Replace gearbox synchros",
            steps:
              "Remove gearbox, replace synchro rings for 2nd and 3rd gear, reassemble and refill with fresh gear oil.",
            estimatedCostEur: "450.00",
            source: "ai",
            likes: 12,
            dislikes: 3,
            myVote: null,
          },
          {
            id: "fix-polo-gearbox-2",
            knownIssueId: "polo-6n1-gearbox-synchros",
            summary: "Full gearbox rebuild with reinforced parts",
            steps:
              "Send gearbox to a specialist for a full rebuild using reinforced aftermarket synchro rings for longer-lasting results.",
            estimatedCostEur: "780.00",
            source: "user",
            likes: 8,
            dislikes: 1,
            myVote: null,
          },
        ],
      },
      {
        id: "polo-6n1-window-regulator",
        title: "Electric window regulator failure",
        description:
          "The front window regulator cable can snap or jam, leaving the window stuck open or closed.",
        severity: "low",
        typicalKm: 90000,
        sources: null,
        fixes: [
          {
            id: "fix-polo-window-1",
            knownIssueId: "polo-6n1-window-regulator",
            summary: "Replace window regulator mechanism",
            steps:
              "Remove door card, disconnect the old regulator, fit a new mechanism and reconnect the window glass.",
            estimatedCostEur: "120.00",
            source: "user",
            likes: 5,
            dislikes: 0,
            myVote: null,
          },
        ],
      },
    ],
  },
  {
    vehicle: {
      id: "veh-clio-4",
      brand: "Renault",
      model: "Clio",
      name: "Clio IV",
      yearFrom: 2015,
      yearTo: 2019,
      engine: "1.5 dCi",
      doors: 5,
      fuelType: "diesel",
      imageUrl: null,
      techSpecs: { power_hp: 90 },
    },
    knownIssues: [
      {
        id: "clio-4-injector-failure",
        title: "dCi injector failure",
        description:
          "Diesel injectors can fail prematurely, causing rough running, increased fuel consumption and a persistent check-engine light.",
        severity: "critical",
        typicalKm: 140000,
        sources: ["https://example.com/clio-dci-injectors"],
        fixes: [
          {
            id: "fix-clio-injector-1",
            knownIssueId: "clio-4-injector-failure",
            summary: "Replace faulty injector(s)",
            steps:
              "Diagnose the faulty cylinder with a balance test, remove and replace the affected injector(s), then reset adaptation values.",
            estimatedCostEur: "520.00",
            source: "ai",
            likes: 20,
            dislikes: 2,
            myVote: null,
          },
        ],
      },
      {
        id: "clio-4-edc-jerking",
        title: "EDC dual-clutch jerking",
        description:
          "The EDC automatic gearbox can shift harshly at low speed, most noticeable in stop-and-go traffic.",
        severity: "medium",
        typicalKm: 60000,
        sources: null,
        fixes: [],
      },
    ],
  },
];

export function findLookup(
  makeSlug: string,
  modelSlug: string,
  year: number
): LookupResponse | undefined {
  return lookupResults.find((result) => {
    const vehicleYearTo = result.vehicle.yearTo ?? result.vehicle.yearFrom;
    return (
      slugify(result.vehicle.brand) === makeSlug &&
      slugify(result.vehicle.model) === modelSlug &&
      year >= result.vehicle.yearFrom &&
      year <= vehicleYearTo
    );
  });
}

export interface LookupStaticParams {
  make: string;
  model: string;
  year: string;
}

export function listLookupStaticParams(): LookupStaticParams[] {
  return lookupResults.flatMap((result) => {
    const make = slugify(result.vehicle.brand);
    const model = slugify(result.vehicle.model);
    const yearTo = result.vehicle.yearTo ?? result.vehicle.yearFrom;

    const years: number[] = [];
    for (let year = result.vehicle.yearFrom; year <= yearTo; year += 1) {
      years.push(year);
    }

    return years.map((year) => ({ make, model, year: String(year) }));
  });
}

export function countSeverities(
  knownIssues: KnownIssue[]
): Record<IssueSeverity, number> {
  const counts: Record<IssueSeverity, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  for (const knownIssue of knownIssues) {
    counts[knownIssue.severity] += 1;
  }

  return counts;
}
