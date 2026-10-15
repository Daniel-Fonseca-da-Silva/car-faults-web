"use server";

import { revalidatePath } from "next/cache";

import {
  createCurrentUserVehicle,
  UserVehicleConflictError,
} from "@/lib/api/users";

export interface AddUserVehicleInput {
  vehicleModelId: string;
  year: number;
}

export type AddUserVehicleResult =
  | { ok: true; userVehicleId: string }
  | { ok: false; error: "conflict" | "unknown" };

/**
 * Only the garage page is revalidated: the vehicle page is shared by every
 * visitor, so its garage button keeps its own state from the returned id.
 */
export async function addUserVehicleAction(
  locale: string,
  input: AddUserVehicleInput
): Promise<AddUserVehicleResult> {
  let userVehicleId: string;
  try {
    ({ id: userVehicleId } = await createCurrentUserVehicle(input));
  } catch (err) {
    if (err instanceof UserVehicleConflictError) {
      return { ok: false, error: "conflict" };
    }
    return { ok: false, error: "unknown" };
  }

  revalidatePath(`/${locale}/garage`);
  return { ok: true, userVehicleId };
}
