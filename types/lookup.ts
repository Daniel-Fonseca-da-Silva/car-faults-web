export type LookupFuelType = "gasoline" | "diesel" | "electric" | "gpl" | "hybrid";

export type IssueSeverity = "low" | "medium" | "high" | "critical";

export type FixSource = "ai" | "user";

export type FixVote = "like" | "dislike";

export interface VehicleTechSpecs {
  power_hp?: number;
  [key: string]: unknown;
}

export interface VehicleLookup {
  id: string;
  brand: string;
  model: string;
  name: string | null;
  yearFrom: number;
  yearTo: number | null;
  engine: string;
  doors: number | null;
  fuelType: LookupFuelType | null;
  imageUrl: string | null;
  techSpecs: VehicleTechSpecs | null;
}

export interface IssueFix {
  id: string;
  knownIssueId?: string;
  userId?: string;
  summary: string;
  steps: string;
  estimatedCostEur: string | number | null;
  source: FixSource;
  likes: number;
  dislikes: number;
  myVote?: FixVote | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface KnownIssue {
  id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  typicalKm: number | null;
  sources: string[] | null;
  fixes: IssueFix[];
}

export interface LookupResponse {
  vehicle: VehicleLookup;
  knownIssues: KnownIssue[];
}
