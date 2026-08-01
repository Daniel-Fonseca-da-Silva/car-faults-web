import {
  getCurrentUser,
  getCurrentUserVehicle,
  getCurrentUserVehicles,
} from "@/lib/api/users";
import { mapLookupLanguage } from "@/lib/lookup/map-lookup-language";
import type { UserProfile } from "@/types/user";
import type { UserVehicle, UserVehicleDetail } from "@/types/user-vehicle";

export interface GaragePageData {
  user: UserProfile;
  vehicles: UserVehicle[];
  selectedVehicle: UserVehicleDetail | null;
}

export async function getGaragePageData(
  locale: string,
  vehicleId?: string
): Promise<GaragePageData | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const language = mapLookupLanguage(locale);

  if (vehicleId) {
    const [vehicles, selectedVehicle] = await Promise.all([
      getCurrentUserVehicles(language),
      getCurrentUserVehicle(vehicleId, language),
    ]);
    return { user, vehicles, selectedVehicle };
  }

  const vehicles = await getCurrentUserVehicles(language);
  const firstVehicleId = vehicles[0]?.id;
  const selectedVehicle = firstVehicleId
    ? await getCurrentUserVehicle(firstVehicleId, language)
    : null;

  return { user, vehicles, selectedVehicle };
}
