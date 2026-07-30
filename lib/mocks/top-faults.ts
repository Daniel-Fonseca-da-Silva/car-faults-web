import type { TopFaultEntry } from "@/types/vehicle";

export const topFaults: TopFaultEntry[] = [
  {
    id: "top-golf-2018",
    vehicle: {
      makeSlug: "volkswagen",
      make: "Volkswagen",
      modelSlug: "golf",
      model: "Golf",
      year: 2018,
    },
    faultTitle: "Timing chain tensioner wear",
    severity: "high",
    reportCount: 412,
  },
  {
    id: "top-serie-3-2016",
    vehicle: {
      makeSlug: "bmw",
      make: "BMW",
      modelSlug: "serie-3",
      model: "Série 3",
      year: 2016,
    },
    faultTitle: "Timing chain and guide wear",
    severity: "critical",
    reportCount: 387,
  },
  {
    id: "top-clio-2019",
    vehicle: {
      makeSlug: "renault",
      make: "Renault",
      modelSlug: "clio",
      model: "Clio",
      year: 2019,
    },
    faultTitle: "EDC dual-clutch jerking",
    severity: "medium",
    reportCount: 231,
  },
  {
    id: "top-classe-c-2017",
    vehicle: {
      makeSlug: "mercedes-benz",
      make: "Mercedes-Benz",
      modelSlug: "classe-c",
      model: "Classe C",
      year: 2017,
    },
    faultTitle: "DPF clogging",
    severity: "medium",
    reportCount: 189,
  },
  {
    id: "top-a3-2015",
    vehicle: {
      makeSlug: "audi",
      make: "Audi",
      modelSlug: "a3",
      model: "A3",
      year: 2015,
    },
    faultTitle: "Intake valve carbon build-up",
    severity: "medium",
    reportCount: 276,
  },
  {
    id: "top-208-2020",
    vehicle: {
      makeSlug: "peugeot",
      make: "Peugeot",
      modelSlug: "208",
      model: "208",
      year: 2020,
    },
    faultTitle: "EGR valve failure",
    severity: "medium",
    reportCount: 134,
  },
];
