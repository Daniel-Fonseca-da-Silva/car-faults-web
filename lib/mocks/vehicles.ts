import type { Vehicle } from "@/types/vehicle";

export const vehicles: Vehicle[] = [
  {
    makeSlug: "volkswagen",
    make: "Volkswagen",
    modelSlug: "golf",
    model: "Golf",
    year: 2018,
    doors: [3, 5],
    engines: [
      { code: "TDI", label: "2.0 TDI", fuel: "diesel", displacementLitres: 2.0 },
      { code: "TSI", label: "1.5 TSI", fuel: "petrol", displacementLitres: 1.5 },
    ],
    reportCount: 1284,
    faults: [
      {
        id: "golf-2018-timing-chain",
        title: "Timing chain tensioner wear",
        description:
          "Early wear of the timing chain tensioner can cause a rattling noise on cold start and, in advanced cases, chain skip that damages valves.",
        severity: "high",
        reportCount: 412,
        typicalCost: { min: 600, max: 1800 },
      },
      {
        id: "golf-2018-dsg-mechatronic",
        title: "DSG mechatronic failure",
        description:
          "The DSG gearbox mechatronic unit can fail prematurely, causing jerky shifts, warning lights, or the gearbox entering safe mode.",
        severity: "critical",
        reportCount: 298,
        typicalCost: { min: 1200, max: 2600 },
      },
    ],
  },
  {
    makeSlug: "volkswagen",
    make: "Volkswagen",
    modelSlug: "golf",
    model: "Golf",
    year: 2019,
    doors: [3, 5],
    engines: [
      { code: "TDI", label: "2.0 TDI", fuel: "diesel", displacementLitres: 2.0 },
      { code: "TSI", label: "1.5 TSI", fuel: "petrol", displacementLitres: 1.5 },
    ],
    reportCount: 967,
    faults: [
      {
        id: "golf-2019-timing-chain",
        title: "Timing chain tensioner wear",
        description:
          "Same tensioner design as the 2018 model year; symptoms include a rattle on cold start that fades as oil pressure builds.",
        severity: "medium",
        reportCount: 251,
        typicalCost: { min: 600, max: 1800 },
      },
      {
        id: "golf-2019-egr-clogging",
        title: "EGR valve clogging",
        description:
          "Carbon build-up in the EGR valve can trigger rough idling and a check-engine light, mostly on short urban trips.",
        severity: "medium",
        reportCount: 176,
        typicalCost: { min: 150, max: 450 },
      },
    ],
  },
  {
    makeSlug: "volkswagen",
    make: "Volkswagen",
    modelSlug: "golf",
    model: "Golf",
    year: 2020,
    doors: [3, 5],
    engines: [
      { code: "TDI", label: "2.0 TDI", fuel: "diesel", displacementLitres: 2.0 },
      { code: "eTSI", label: "1.5 eTSI", fuel: "hybrid", displacementLitres: 1.5 },
    ],
    reportCount: 543,
    faults: [
      {
        id: "golf-2020-egr-clogging",
        title: "EGR valve clogging",
        description:
          "Carbon build-up in the EGR valve can trigger rough idling and a check-engine light, mostly on short urban trips.",
        severity: "low",
        reportCount: 98,
        typicalCost: { min: 150, max: 450 },
      },
    ],
  },
  {
    makeSlug: "bmw",
    make: "BMW",
    modelSlug: "serie-3",
    model: "Série 3",
    year: 2016,
    doors: [4],
    engines: [
      { code: "320d", label: "320d 2.0", fuel: "diesel", displacementLitres: 2.0 },
    ],
    reportCount: 1042,
    faults: [
      {
        id: "serie-3-2016-timing-chain",
        title: "Timing chain and guide wear",
        description:
          "Plastic timing chain guides degrade over time and can shed debris, leading to a rattle at start-up and, if ignored, chain failure.",
        severity: "critical",
        reportCount: 387,
        typicalCost: { min: 1500, max: 3200 },
      },
      {
        id: "serie-3-2016-egr-valve",
        title: "EGR valve clogging",
        description:
          "Soot accumulation restricts the EGR valve, causing limp mode and reduced power on the highway.",
        severity: "medium",
        reportCount: 214,
        typicalCost: { min: 200, max: 550 },
      },
    ],
  },
  {
    makeSlug: "renault",
    make: "Renault",
    modelSlug: "clio",
    model: "Clio",
    year: 2019,
    doors: [5],
    engines: [
      { code: "TCe", label: "1.0 TCe", fuel: "petrol", displacementLitres: 1.0 },
      { code: "dCi", label: "1.5 dCi", fuel: "diesel", displacementLitres: 1.5 },
    ],
    reportCount: 876,
    faults: [
      {
        id: "clio-2019-edc-jerking",
        title: "EDC dual-clutch jerking",
        description:
          "The EDC automatic gearbox can shift harshly at low speed, most noticeable in stop-and-go traffic.",
        severity: "medium",
        reportCount: 231,
        typicalCost: { min: 300, max: 900 },
      },
      {
        id: "clio-2019-injector-failure",
        title: "dCi injector failure",
        description:
          "Diesel injectors on the 1.5 dCi can fail prematurely, causing rough running and increased fuel consumption.",
        severity: "high",
        reportCount: 165,
        typicalCost: { min: 400, max: 1100 },
      },
    ],
  },
  {
    makeSlug: "mercedes-benz",
    make: "Mercedes-Benz",
    modelSlug: "classe-c",
    model: "Classe C",
    year: 2017,
    doors: [4],
    engines: [
      { code: "C220d", label: "C220 d 2.1", fuel: "diesel", displacementLitres: 2.1 },
    ],
    reportCount: 754,
    faults: [
      {
        id: "classe-c-2017-rear-axle-noise",
        title: "Rear axle knocking noise",
        description:
          "A clunk from the rear axle over bumps, usually traced to worn subframe bushings.",
        severity: "medium",
        reportCount: 143,
        typicalCost: { min: 350, max: 900 },
      },
      {
        id: "classe-c-2017-dpf-clogging",
        title: "DPF clogging",
        description:
          "Frequent short trips prevent the diesel particulate filter from regenerating, triggering warning lights and reduced power.",
        severity: "medium",
        reportCount: 189,
        typicalCost: { min: 300, max: 1600 },
      },
    ],
  },
  {
    makeSlug: "audi",
    make: "Audi",
    modelSlug: "a3",
    model: "A3",
    year: 2015,
    doors: [3, 5],
    engines: [
      { code: "TFSI", label: "1.4 TFSI", fuel: "petrol", displacementLitres: 1.4 },
      { code: "TDI", label: "2.0 TDI", fuel: "diesel", displacementLitres: 2.0 },
    ],
    reportCount: 1189,
    faults: [
      {
        id: "a3-2015-carbon-buildup",
        title: "Intake valve carbon build-up",
        description:
          "Direct injection TFSI engines accumulate carbon on the intake valves over time, causing rough idle and hesitation.",
        severity: "medium",
        reportCount: 276,
        typicalCost: { min: 250, max: 700 },
      },
      {
        id: "a3-2015-timing-chain",
        title: "Timing chain tensioner wear",
        description:
          "A known weak point on early TFSI units; a rattle on cold start is the first symptom.",
        severity: "high",
        reportCount: 198,
        typicalCost: { min: 700, max: 1900 },
      },
    ],
  },
  {
    makeSlug: "peugeot",
    make: "Peugeot",
    modelSlug: "208",
    model: "208",
    year: 2020,
    doors: [5],
    engines: [
      { code: "PureTech", label: "1.2 PureTech", fuel: "petrol", displacementLitres: 1.2 },
      { code: "BlueHDi", label: "1.5 BlueHDi", fuel: "diesel", displacementLitres: 1.5 },
    ],
    reportCount: 612,
    faults: [
      {
        id: "208-2020-egr-failure",
        title: "EGR valve failure",
        description:
          "The EGR valve can seize open or closed, leading to poor idle quality or a persistent check-engine light.",
        severity: "medium",
        reportCount: 134,
        typicalCost: { min: 180, max: 500 },
      },
      {
        id: "208-2020-gearbox-judder",
        title: "Automatic gearbox judder",
        description:
          "The 8-speed automatic can judder on light throttle at low speed, most reports point to a software fix under warranty.",
        severity: "low",
        reportCount: 87,
        typicalCost: { min: 0, max: 350 },
      },
    ],
  },
];

export function findVehicle(
  makeSlug: string,
  modelSlug: string,
  year: number
): Vehicle | undefined {
  return vehicles.find(
    (vehicle) =>
      vehicle.makeSlug === makeSlug &&
      vehicle.modelSlug === modelSlug &&
      vehicle.year === year
  );
}

export function relatedVehicles(vehicle: Vehicle): Vehicle[] {
  return vehicles.filter(
    (candidate) =>
      candidate !== vehicle &&
      candidate.makeSlug === vehicle.makeSlug &&
      candidate.modelSlug === vehicle.modelSlug
  );
}

export function listMakes(): string[] {
  return Array.from(new Set(vehicles.map((vehicle) => vehicle.makeSlug))).sort();
}
