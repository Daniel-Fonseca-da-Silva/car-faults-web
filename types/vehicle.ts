export type FaultSeverity = "low" | "medium" | "high" | "critical";

export interface TopFaultEntry {
  id: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    engine: string;
    // Lookup identity value (e.g. "gasoline", "diesel"), not the FuelType
    // union above - kept as a plain string since it's opaque here and only
    // ever round-tripped into the vehicle lookup query string.
    fuelType?: string;
    doors?: number;
  };
  faultTitle: string;
  severity: FaultSeverity;
  reportCount: number;
  // API language tag (e.g. "pt-PT") this fault's content is actually
  // written in. The API falls back to another locale when the requested
  // one has no content yet for this fault, so this can differ from the
  // page's locale - compare the two to show a notice.
  contentLocale: string;
}
