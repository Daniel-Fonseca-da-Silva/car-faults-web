import type { UserProfile } from "@/types/user";
import type { UserStats } from "@/types/user-stats";
import type { UserVehicle } from "@/types/user-vehicle";

export const profileUser: UserProfile = {
  id: "b3a5c1d2-4e6f-4a8b-9c0d-1e2f3a4b5c6d",
  email: "ana@example.com",
  name: "Ana Silva",
  avatarUrl: "https://cdn.example.com/avatars/ana.jpg",
  createdAt: "2026-07-17T10:00:00.000Z",
  updatedAt: "2026-07-17T10:00:00.000Z",
};

export const profileVehicles: UserVehicle[] = [
  {
    id: "uv-polo-6n1",
    vehicleModelId: "veh-polo-6n1",
    brand: "Volkswagen",
    model: "Polo",
    year: 1996,
    engine: "1.0",
    name: "Polo 6N1",
    doors: 3,
    createdAt: "2026-01-12T09:30:00.000Z",
    updatedAt: "2026-01-12T09:30:00.000Z",
    knownIssuesCount: 2,
  },
  {
    id: "uv-uno-mille",
    vehicleModelId: null,
    brand: "Fiat",
    model: "Uno Mille",
    year: 2007,
    engine: "1.0",
    name: null,
    doors: 5,
    createdAt: "2026-02-03T14:15:00.000Z",
    updatedAt: "2026-02-03T14:15:00.000Z",
    knownIssuesCount: 4,
  },
  {
    id: "uv-fiesta",
    vehicleModelId: null,
    brand: "Ford",
    model: "Fiesta",
    year: 2012,
    engine: "1.6 TDCi",
    name: null,
    doors: 5,
    createdAt: "2026-03-21T18:45:00.000Z",
    updatedAt: "2026-03-21T18:45:00.000Z",
    knownIssuesCount: 1,
  },
];

export const profileStats: UserStats = {
  searchesCount: 47,
  defectsConsultedCount: 128,
  savedVehiclesCount: profileVehicles.length,
  votesCount: 23,
  dislikesCount: 4,
  favoritedVehiclesCount: 2,
};
