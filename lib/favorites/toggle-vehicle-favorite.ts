"use server";

import { revalidatePath } from "next/cache";

import { favoriteVehicle, unfavoriteVehicle } from "@/lib/api/activity-logs";

// The vehicle page is shared by every visitor, so it isn't revalidated: its
// favorite button keeps its own state.
export async function favoriteVehicleAction(
  locale: string,
  vehicleModelId: string,
  year: number
): Promise<void> {
  await favoriteVehicle(vehicleModelId, year);
  revalidatePath(`/${locale}/profile`);
  revalidatePath(`/${locale}/favorites`);
}

export async function unfavoriteVehicleAction(
  locale: string,
  vehicleModelId: string,
  year: number
): Promise<void> {
  await unfavoriteVehicle(vehicleModelId, year);
  revalidatePath(`/${locale}/profile`);
  revalidatePath(`/${locale}/favorites`);
}
