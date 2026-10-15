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

/** The vehicle page is shared by every visitor, so only the garage is revalidated. */
export async function removeUserVehicleFromVehiclePageAction(
  locale: string,
  id: string
): Promise<void> {
  await deleteCurrentUserVehicle(id);
  revalidatePath(`/${locale}/garage`);
}
