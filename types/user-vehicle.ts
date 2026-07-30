export interface UserVehicle {
  id: string;
  vehicleModelId: string | null;
  brand: string;
  model: string;
  year: number;
  engine: string;
  name: string | null;
  doors: number | null;
  createdAt: string;
  updatedAt: string;
  /** Presentation-only field: known issue count is not part of the list endpoint. */
  knownIssuesCount?: number;
}
