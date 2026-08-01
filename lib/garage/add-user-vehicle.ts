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
  | { ok: true }
  | { ok: false; error: "conflict" | "unknown" };

export async function addUserVehicleAction(
  locale: string,
  currentPath: string,
  input: AddUserVehicleInput
): Promise<AddUserVehicleResult> {
  try {
    await createCurrentUserVehicle(input);
  } catch (err) {
    if (err instanceof UserVehicleConflictError) {
      return { ok: false, error: "conflict" };
    }
    return { ok: false, error: "unknown" };
  }

  revalidatePath(`/${locale}/garage`);
  revalidatePath(currentPath);
  return { ok: true };
}
