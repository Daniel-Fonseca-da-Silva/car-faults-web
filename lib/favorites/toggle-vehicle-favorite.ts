"use server";

import { revalidatePath } from "next/cache";

import { favoriteVehicle, unfavoriteVehicle } from "@/lib/api/activity-logs";

export async function favoriteVehicleAction(
  locale: string,
  currentPath: string,
  vehicleModelId: string,
  year: number
): Promise<void> {
  await favoriteVehicle(vehicleModelId, year);
  revalidatePath(`/${locale}/profile`);
  revalidatePath(`/${locale}/favorites`);
  revalidatePath(currentPath);
}

export async function unfavoriteVehicleAction(
  locale: string,
  currentPath: string,
  vehicleModelId: string,
  year: number
): Promise<void> {
  await unfavoriteVehicle(vehicleModelId, year);
  revalidatePath(`/${locale}/profile`);
  revalidatePath(`/${locale}/favorites`);
  revalidatePath(currentPath);
}
