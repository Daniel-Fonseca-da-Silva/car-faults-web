"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { deleteCurrentUserVehicle } from "@/lib/api/users";

export async function removeUserVehicleAction(
  locale: string,
  id: string
): Promise<void> {
  await deleteCurrentUserVehicle(id);
  revalidatePath(`/${locale}/garage`);
  redirect(`/${locale}/garage`);
}

export async function removeUserVehicleFromVehiclePageAction(
  locale: string,
  currentPath: string,
  id: string
): Promise<void> {
  await deleteCurrentUserVehicle(id);
  revalidatePath(`/${locale}/garage`);
  revalidatePath(currentPath);
}
