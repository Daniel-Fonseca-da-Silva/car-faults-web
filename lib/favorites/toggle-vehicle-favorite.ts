"use server";

import { revalidatePath } from "next/cache";

import { favoriteVehicle, unfavoriteVehicle } from "@/lib/api/activity-logs";

export async function favoriteVehicleAction(
  locale: string,
  currentPath: string,
  vehicleModelId: string
): Promise<void> {
  await favoriteVehicle(vehicleModelId);
  revalidatePath(`/${locale}/profile`);
  revalidatePath(currentPath);
}

export async function unfavoriteVehicleAction(
  locale: string,
  currentPath: string,
  vehicleModelId: string
): Promise<void> {
  await unfavoriteVehicle(vehicleModelId);
  revalidatePath(`/${locale}/profile`);
  revalidatePath(currentPath);
}
